variable "aws_region" {
  description = "AWS region to deploy all resources into."
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Short project name used to prefix and tag resources (lowercase, no spaces)."
  type        = string
  default     = "billetera"

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

variable "container_port" {
  description = "Port the Next.js standalone server listens on inside the container."
  type        = number
  default     = 3000
}

variable "app_image_tag" {
  description = "Tag of the Docker image to deploy from the ECR repository."
  type        = string
  default     = "latest"
}

variable "task_cpu" {
  description = "CPU units for the ECS task (Fargate valid values: 256, 512, 1024, ...)."
  type        = number
  default     = 256
}

variable "task_memory" {
  description = "Memory (MiB) for the ECS task. Must be a valid Fargate cpu/memory combo (256/512 is the smallest)."
  type        = number
  default     = 512
}

variable "desired_count" {
  description = "Number of running ECS task replicas (Fargate tasks)."
  type        = number
  default     = 1
}

variable "backend_url" {
  description = "Base URL of the backend API, forwarded to the container as BACKEND_URL. Backend is out of scope."
  type        = string
  default     = ""
}
