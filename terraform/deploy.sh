#!/usr/bin/env bash
#
# deploy.sh — Compila el export estático de Next.js y despliega a S3 + CloudFront.
#
# Lo que hace (en orden):
#   1. terraform apply  → crea/actualiza S3, CloudFront y recursos asociados
#   2. npm run build    → genera el export estático en out/
#   3. aws s3 sync      → sube los archivos estáticos a S3
#   4. cloudfront invalidation → invalida la caché de CloudFront
#   5. imprime la URL de CloudFront
#
# Uso:
#   ./deploy.sh                       # región por defecto de AWS config
#   AWS_REGION=us-east-2 ./deploy.sh  # sobreescribir región
#
set -euo pipefail

# --- rutas y configuración --------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$SCRIPT_DIR"

# --- prerequisitos -----------------------------------------------------------
echo "==> Verificando prerequisitos..."
for cmd in terraform aws node npm; do
  command -v "$cmd" >/dev/null 2>&1 || {
    echo "ERROR: '$cmd' no está instalado o no está en PATH." >&2; exit 1; }
done
ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text 2>/dev/null)" || {
  echo "ERROR: no autenticado en AWS. Ejecuta 'aws configure' o configura credenciales." >&2; exit 1; }

REGION="$(aws configure get region 2>/dev/null || echo 'us-east-1')"

# --- confirmación -----------------------------------------------------------
echo
echo "Cuenta: $ACCOUNT_ID | Región: $REGION"
echo "Esto creará un bucket S3 privado con distribución CloudFront."
echo "Costo estimado: ~USD 0.02 - 0.10/mes (muy económico)."
echo
read -r -p "¿Continuar? [y/N] " ans
[[ "$ans" =~ ^[Yy]$ ]] || { echo "Abortado. No se creó nada."; exit 0; }

# --- 1. terraform apply -----------------------------------------------------
echo "==> terraform init + apply..."
if [ ! -d ".terraform" ]; then
  BUCKET="banca-simplificada-tf-state-324486142059"
  echo "Inicializando con backend remoto S3 por defecto ($BUCKET)..."
  terraform init -backend-config="bucket=$BUCKET" -backend-config="key=frontend/terraform.tfstate" -backend-config="region=us-east-1" -backend-config="encrypt=true" -input=false || {
    echo "Fallo la inicialización con backend-config, intentando inicialización simple..."
    terraform init -input=false
  }
else
  terraform init -input=false
fi
terraform apply -auto-approve

# --- 2. compilar el export estático de Next.js -------------------------------
BUCKET="$(terraform output -raw s3_bucket_name)"

echo "==> Compilando export estático de Next.js (npm run build)..."
cd "$ROOT_DIR"
npm run build

# Verificar que se creó el directorio out/
if [ ! -d "out" ]; then
  echo "ERROR: directorio 'out/' no encontrado. Asegúrate de que next.config tenga output: 'export'." >&2
  exit 1
fi

# --- 3. sincronizar con S3 ---------------------------------------------------
echo "==> Subiendo archivos estáticos a s3://$BUCKET..."
aws s3 sync out/ "s3://$BUCKET" \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "*.html" \
  --exclude "_next/data/*"

# Archivos HTML con caché corta (para que nuevos deploys se reflejen rápido)
aws s3 sync out/ "s3://$BUCKET" \
  --delete \
  --cache-control "public, max-age=0, must-revalidate" \
  --exclude "*" \
  --include "*.html"

# Archivos JSON de _next/data también con caché corta
if [ -d "out/_next/data" ]; then
  aws s3 sync out/_next/data/ "s3://$BUCKET/_next/data/" \
    --cache-control "public, max-age=0, must-revalidate"
fi

# --- 4. invalidar caché de CloudFront ----------------------------------------
cd "$SCRIPT_DIR"
DISTRIBUTION_ID="$(terraform output -raw cloudfront_distribution_id)"
CLOUDFRONT_URL="$(terraform output -raw cloudfront_domain_name)"

echo "==> Invalidando caché de CloudFront (distribución: $DISTRIBUTION_ID)..."
aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths '/*' > /dev/null
echo "    Invalidación creada. Puede tardar unos minutos en propagarse."

# --- 5. listo ----------------------------------------------------------------
echo
echo "==> ¡Despliegue exitoso!"
echo "    URL: $CLOUDFRONT_URL"
echo "    Ejecuta ./destroy.sh cuando quieras destruir la infraestructura."
