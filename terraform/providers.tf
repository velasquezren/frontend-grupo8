# -----------------------------------------------------------------------------
# Provider configuration
# Uses the standard AWS credential chain:
#   1. Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
#   2. Shared credentials file (~/.aws/credentials)
#   3. IAM instance profile (if running on EC2/ECS)
#
# Run `aws configure` to set up credentials locally.
# -----------------------------------------------------------------------------

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.60"
    }
  }

  # Estado remoto S3 — recomendado para producción y GitHub Actions
  backend "s3" {}
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# CloudFront requires ACM certificates in us-east-1.
# If the main region differs, this aliased provider handles that.
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}
