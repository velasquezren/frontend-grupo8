# -----------------------------------------------------------------------------
# ECR — where the frontend Docker image lives
# -----------------------------------------------------------------------------

resource "aws_ecr_repository" "this" {
  name                 = "${var.project_name}-${var.environment}"
  image_tag_mutability = "MUTABLE"

  # Allow `terraform destroy` to delete the repository even when it still
  # contains images. Without this, teardown fails after the first push.
  force_delete = true

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-ecr"
  }
}

# Keep only the 5 most recent images to control storage cost.
resource "aws_ecr_lifecycle_policy" "this" {
  repository = aws_ecr_repository.this.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 5 images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 5
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}
