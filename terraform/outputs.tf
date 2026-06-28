output "vpc_id" {
  description = "ID of the VPC created for this deployment."
  value       = aws_vpc.this.id
}

output "ecs_cluster_name" {
  description = "Name of the ECS cluster."
  value       = aws_ecs_cluster.this.name
}

output "ecs_service_name" {
  description = "Name of the ECS service (used by deploy scripts to force a redeploy)."
  value       = aws_ecs_service.app.name
}

output "ecr_repository_uri" {
  description = "URI of the ECR repository — use as the Docker image tag target."
  value       = aws_ecr_repository.this.repository_url
}

output "alb_dns_name" {
  description = "Public DNS name of the Application Load Balancer."
  value       = aws_lb.this.dns_name
}

output "app_url" {
  description = "HTTP URL where the frontend is served once tasks are healthy."
  value       = "http://${aws_lb.this.dns_name}"
}
