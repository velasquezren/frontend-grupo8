# Terraform — Banca Simplificada Frontend (S3 + CloudFront)

Despliega el frontend Next.js como un **sitio estático** en **Amazon S3** con
**CloudFront** como CDN global. Este approach es ideal para un frontend que no
requiere Server-Side Rendering (SSR).

> **Scope:** Frontend únicamente. El backend (microservicios ECS) es manejado
> por otro equipo en su propia cuenta AWS. El frontend se conecta al backend
> vía la URL pública del API Gateway.

## Arquitectura

```
Internet ──► CloudFront (CDN global, HTTPS)
                 │
                 ▼
             S3 Bucket (privado, archivos estáticos)
                 │
                 └── out/          ← Next.js static export
                     ├── index.html
                     ├── dashboard.html
                     ├── cuentas.html
                     ├── movimientos.html
                     ├── transferencias.html
                     ├── perfil.html
                     └── _next/static/  ← JS, CSS, imágenes
```

### Ventajas sobre ECS Fargate

| Aspecto | S3 + CloudFront | ECS Fargate |
|---------|----------------|-------------|
| **Costo mensual** | ~$1-3 USD | ~$30-35 USD |
| **Latencia** | CDN global (edge locations) | Una región |
| **HTTPS** | ✅ Gratis (certificado CloudFront) | ❌ Requiere ACM + dominio |
| **Complejidad** | Baja (bucket + CDN) | Alta (VPC, ALB, ECS, ECR, NAT) |
| **Escalabilidad** | Automática e ilimitada | Manual (desired_count) |
| **Mantenimiento** | Cero (serverless) | Monitorear tasks/containers |

## Prerrequisitos

1. **AWS CLI** configurado (`aws configure`) con permisos para S3, CloudFront, IAM.
2. **Terraform** >= 1.5 — [Descargar](https://developer.hashicorp.com/terraform/downloads).
3. **Node.js** >= 18 + npm.

## Despliegue

Todos los comandos se ejecutan desde el directorio `terraform/`.

### Opción A: Script automático (recomendada)

```bash
chmod +x deploy.sh destroy.sh
./deploy.sh
```

El script ejecuta automáticamente:
1. `terraform apply` → crea el bucket S3 + distribución CloudFront
2. `npm run build` → genera el export estático en `out/`
3. `aws s3 sync` → sube los archivos al bucket
4. Invalida la caché de CloudFront
5. Imprime la URL pública

### Opción B: Manual paso a paso

```bash
# 1. Crear infraestructura
terraform init
terraform apply

# 2. Build del frontend
cd ..
npm run build
cd terraform

# 3. Subir archivos
BUCKET=$(terraform output -raw s3_bucket_name)
aws s3 sync ../out/ "s3://$BUCKET" --delete

# 4. Invalidar caché
DIST_ID=$(terraform output -raw cloudfront_distribution_id)
aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths "/*"

# 5. Obtener URL
terraform output -raw cloudfront_url
```

### Conectar con el Backend

Cuando el equipo de backend despliegue sus microservicios, pasa la URL del
API Gateway como variable:

```bash
terraform apply -var 'backend_url=https://abc123.execute-api.us-east-1.amazonaws.com'
```

### Destruir infraestructura

```bash
./destroy.sh
```

> **Nota:** CloudFront puede tardar 5-10 minutos en deshabilitarse y eliminarse.

## Variables

| Variable | Default | Descripción |
|----------|---------|-------------|
| `aws_region` | `us-east-1` | Región AWS para el bucket S3 |
| `project_name` | `banca-g8` | Prefijo para nombrar recursos |
| `environment` | `dev` | Nombre del entorno |
| `backend_url` | `""` | URL del API Gateway del backend |
| `price_class` | `PriceClass_100` | Clase de precio CloudFront (100=más barato) |
| `default_root_object` | `index.html` | Objeto raíz de CloudFront |

## Notas

- **HTTPS automático:** CloudFront provee un certificado TLS por defecto para
  el dominio `*.cloudfront.net`. No necesitas ACM ni dominio propio.
- **Caché inteligente:** Los archivos HTML se sirven con `must-revalidate`,
  mientras los assets (`_next/static/`) se sirven con caché de 1 año
  (son immutables por el hash en el nombre).
- **SPA Routing:** CloudFront redirige errores 403/404 a `index.html` para
  que el routing de Next.js funcione correctamente.
- **next.config.ts:** Debe tener `output: "export"` para generar archivos
  estáticos en `out/`. Esto se configura automáticamente en esta rama.
