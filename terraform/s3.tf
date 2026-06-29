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

# Allow CloudFront OAC access but block direct public internet access
resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Bucket policy: allow read access only to the CloudFront distribution via OAC
resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowCloudFrontOAC"
        Effect    = "Allow"
        Principal = { Service = "cloudfront.amazonaws.com" }
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.frontend.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.frontend.arn
          }
        }
      }
    ]
  })

  depends_on = [
    aws_s3_bucket_public_access_block.frontend,
    aws_cloudfront_distribution.frontend
  ]
}

# Versionamiento habilitado para capacidad de rollback
resource "aws_s3_bucket_versioning" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  versioning_configuration {
    status = "Enabled"
  }
}
