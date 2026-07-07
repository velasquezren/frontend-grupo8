# -----------------------------------------------------------------------------
# Variables — S3 + CloudFront static frontend
# -----------------------------------------------------------------------------

variable "aws_region" {
  description = "AWS region for the S3 bucket."
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Short project name used to prefix and tag resources (lowercase, no spaces)."
  type        = string
  default     = "banca-g8-v2"

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{1,28}$", var.project_name))
    error_message = "project_name must be lowercase letters/digits/hyphens, 2-30 chars."
  }
}

variable "environment" {
  description = "Deployment environment name (e.g. dev, staging, prod)."
  type        = string
  default     = "dev"
}

variable "backend_url" {
  description = "Base URL of the backend API Gateway (output api_gateway_url from the backend team). Example: https://abc123.execute-api.us-east-1.amazonaws.com"
  type        = string
  default     = ""
}

variable "default_root_object" {
  description = "Default root object served by CloudFront (typically index.html)."
  type        = string
  default     = "index.html"
}

variable "price_class" {
  description = "CloudFront price class. PriceClass_100 = cheapest (US, Canada, Europe only)."
  type        = string
  default     = "PriceClass_100"

  validation {
    condition     = contains(["PriceClass_100", "PriceClass_200", "PriceClass_All"], var.price_class)
    error_message = "Must be PriceClass_100, PriceClass_200, or PriceClass_All."
  }
}
