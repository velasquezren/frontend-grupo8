# -----------------------------------------------------------------------------
# S3 bucket — almacena los archivos estáticos del frontend Next.js (export)
#
# El bucket NO es público. CloudFront accede mediante Origin Access Control (OAC),
# lo que garantiza que los objetos solo se sirvan a través de la CDN.
# -----------------------------------------------------------------------------

resource "aws_s3_bucket" "frontend" {
  bucket        = "${var.project_name}-${var.environment}-frontend"
  force_destroy = true # Permite terraform destroy aunque el bucket tenga objetos

  tags = {
    Name = "${var.project_name}-${var.environment}-frontend"
  }
}

# Configuración de hosting estático del bucket S3
resource "aws_s3_bucket_website_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  index_document {
    suffix = var.default_root_object
  }

  error_document {
    key = var.default_root_object # Fallback para SPA routing
  }
}

# Permitir acceso público de lectura para el sitio web estático de S3
resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# Política de bucket que permite lectura pública a todos los objetos (requerido para S3 website)
resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.frontend.arn}/*"
      }
    ]
  })

  depends_on = [
    aws_s3_bucket_public_access_block.frontend
  ]
}

# Versionamiento habilitado para capacidad de rollback
resource "aws_s3_bucket_versioning" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  versioning_configuration {
    status = "Enabled"
  }
}
