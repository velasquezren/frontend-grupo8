# -----------------------------------------------------------------------------
# CloudFront Distribution — serves the Next.js static website via CDN
#
# Configured with Origin Access Control (OAC) to secure the S3 bucket.
# -----------------------------------------------------------------------------

# Origin Access Control (OAC) para el bucket S3
resource "aws_cloudfront_origin_access_control" "frontend" {
  name                              = "${var.project_name}-${var.environment}-oac"
  description                       = "OAC para restringir acceso directo a S3"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# Política de cabeceras de respuesta para CORS
resource "aws_cloudfront_response_headers_policy" "cors" {
  name    = "${var.project_name}-${var.environment}-cors-policy"
  comment = "Permitir CORS desde cualquier origen para recursos estaticos"

  cors_config {
    access_control_allow_credentials = false
    origin_override                  = true

    access_control_allow_headers {
      items = ["*"]
    }

    access_control_allow_methods {
      items = ["GET", "HEAD", "OPTIONS"]
    }

    access_control_allow_origins {
      items = ["*"]
    }

    access_control_max_age_sec = 86400
  }
}

# Distribución de CloudFront
resource "aws_cloudfront_distribution" "frontend" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = var.default_root_object
  comment             = "${var.project_name} ${var.environment} - Frontend SPA"
  price_class         = var.price_class

  origin {
    domain_name              = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id                = "s3-frontend"
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend.id
  }

  default_cache_behavior {
    allowed_methods            = ["GET", "HEAD", "OPTIONS"]
    cached_methods             = ["GET", "HEAD"]
    target_origin_id           = "s3-frontend"
    viewer_protocol_policy     = "redirect-to-https"
    compress                   = true
    
    # Cache Policy: Managed-CachingOptimized
    cache_policy_id            = "658327ea-f89d-4fab-a63d-7e88639e58f6"
    response_headers_policy_id = aws_cloudfront_response_headers_policy.cors.id
  }

  # Redirecciones para SPA (Single Page Application)
  custom_error_response {
    error_caching_min_ttl = 10
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
  }

  custom_error_response {
    error_caching_min_ttl = 10
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-cloudfront"
  }
}
