# -----------------------------------------------------------------------------
# IAM — ECS task execution role
# The execution role is used by the ECS agent to: pull the image from ECR,
# fetch the ECR auth token, and write logs to CloudWatch.
# -----------------------------------------------------------------------------

data "aws_iam_policy_document" "ecs_tasks_trust" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ecs_execution" {
  name               = "${var.project_name}-${var.environment}-ecs-exec"
  assume_role_policy = data.aws_iam_policy_document.ecs_tasks_trust.json

  tags = {
    Name = "${var.project_name}-${var.environment}-ecs-exec-role"
  }
}

# Inline least-privilege policy — the SOLE policy for this role.
# Grants exactly what the ECS task execution needs, scoped to THIS repository
# and log group (instead of the broad managed AmazonECSTaskExecutionRolePolicy
# on "*", which also requires the deployer to hold iam:AttachRolePolicy).
# NOTE: ecr:GetAuthorizationToken only supports Resource "*" (AWS limitation).
data "aws_iam_policy_document" "ecs_execution_inline" {
  statement {
    sid    = "EcrAuth"
    effect = "Allow"
    actions = [
      "ecr:GetAuthorizationToken",
    ]
    resources = ["*"]
  }

  statement {
    sid    = "EcrPull"
    effect = "Allow"
    actions = [
      "ecr:BatchCheckLayerAvailability",
      "ecr:GetDownloadUrlForLayer",
      "ecr:BatchGetImage",
    ]
    resources = [aws_ecr_repository.this.arn]
  }

  statement {
    sid    = "CloudWatchLogs"
    effect = "Allow"
    actions = [
      "logs:CreateLogStream",
      "logs:CreateLogGroup",
      "logs:PutLogEvents",
    ]
    resources = ["${aws_cloudwatch_log_group.this.arn}:*"]
  }
}

resource "aws_iam_role_policy" "ecs_execution" {
  name   = "${var.project_name}-${var.environment}-ecs-exec-inline"
  role   = aws_iam_role.ecs_execution.id
  policy = data.aws_iam_policy_document.ecs_execution_inline.json
}
