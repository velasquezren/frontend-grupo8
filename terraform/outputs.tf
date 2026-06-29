# -----------------------------------------------------------------------------
# Outputs — S3 + CloudFront
# -----------------------------------------------------------------------------

output "website_url" {
  description = "URL pública del frontend (endpoint estático de S3)."
  value       = "http://${aws_s3_bucket_website_configuration.frontend.website_endpoint}"
}

output "s3_bucket_name" {
  description = "Nombre del bucket S3 que almacena los archivos estáticos."
  value       = aws_s3_bucket.frontend.id
}

output "s3_bucket_arn" {
  description = "ARN del bucket S3."
  value       = aws_s3_bucket.frontend.arn
}

output "cloudfront_distribution_id" {
  description = "ID de la distribución CloudFront."
  value       = aws_cloudfront_distribution.frontend.id
}

output "cloudfront_domain_name" {
  description = "URL HTTPS de la distribución CloudFront."
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}

output "cloudfront_arn" {
  description = "ARN de la distribución CloudFront."
  value       = aws_cloudfront_distribution.frontend.arn
}
