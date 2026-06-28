# -----------------------------------------------------------------------------
# CloudWatch Logs — where ECS container stdout/stderr lands
# -----------------------------------------------------------------------------

resource "aws_cloudwatch_log_group" "this" {
  name              = "/ecs/${var.project_name}-${var.environment}"
  retention_in_days = 7

  tags = {
    Name = "${var.project_name}-${var.environment}-logs"
  }
}
