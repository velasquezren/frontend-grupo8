# -----------------------------------------------------------------------------
# S3 bucket — hosts the Next.js static website (output: "export")
#
# Configured as a public static website to bypass CloudFront account verification locks.
# -----------------------------------------------------------------------------

resource "aws_s3_bucket" "frontend" {
  bucket        = "${var.project_name}-${var.environment}-frontend"
  force_destroy = true # Allow terraform destroy even if the bucket has objects

  tags = {
    Name = "${var.project_name}-${var.environment}-frontend"
  }
}

# Configure S3 bucket website hosting
resource "aws_s3_bucket_website_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  index_document {
    suffix = var.default_root_object
  }

  error_document {
    key = var.default_root_object # SPA Routing fallback
  }
}

# Allow public policies so S3 can serve the files to anonymous users
resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# Bucket policy: allow anonymous read access to everyone
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

  depends_on = [aws_s3_bucket_public_access_block.frontend]
}

# Enable versioning for rollback capability
resource "aws_s3_bucket_versioning" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  versioning_configuration {
    status = "Enabled"
  }
}
