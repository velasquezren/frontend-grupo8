# -----------------------------------------------------------------------------
# Outputs
# -----------------------------------------------------------------------------

output "website_url" {
  description = "Public URL of the frontend (S3 Static Website endpoint)."
  value       = "http://${aws_s3_bucket_website_configuration.frontend.website_endpoint}"
}

output "s3_bucket_name" {
  description = "Name of the S3 bucket hosting the static files."
  value       = aws_s3_bucket.frontend.id
}

output "s3_bucket_arn" {
  description = "ARN of the S3 bucket."
  value       = aws_s3_bucket.frontend.arn
}
