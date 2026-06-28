# -----------------------------------------------------------------------------
# ECS — Fargate cluster, task definition and service
# -----------------------------------------------------------------------------

resource "aws_ecs_cluster" "this" {
  name = "${var.project_name}-${var.environment}"

  tags = {
    Name = "${var.project_name}-${var.environment}-cluster"
  }
}

resource "aws_ecs_task_definition" "app" {
  family                   = "${var.project_name}-${var.environment}"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.task_cpu
  memory                   = var.task_memory
  execution_role_arn       = aws_iam_role.ecs_execution.arn

  container_definitions = jsonencode([
    {
      name  = "app"
      image = "${aws_ecr_repository.this.repository_url}:${var.app_image_tag}"

      essential = true

      portMappings = [
        {
          containerPort = var.container_port
          hostPort      = var.container_port
          protocol      = "tcp"
        }
      ]

      environment = [
        # CRITICAL: Next.js standalone server.js binds to HOSTNAME. If this is
        # not 0.0.0.0 the process listens only on 127.0.0.1 and the ALB health
        # check fails. Set explicitly even though the Dockerfile also sets it.
        { name = "HOSTNAME", value = "0.0.0.0" },
        { name = "PORT", value = tostring(var.container_port) },
        { name = "NODE_ENV", value = "production" },
        { name = "NEXT_TELEMETRY_DISABLED", value = "1" },
        { name = "BACKEND_URL", value = var.backend_url },
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.this.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "app"
        }
      }
    }
  ])

  tags = {
    Name = "${var.project_name}-${var.environment}-task"
  }
}

resource "aws_ecs_service" "app" {
  name                              = "${var.project_name}-${var.environment}-svc"
  cluster                           = aws_ecs_cluster.this.id
  task_definition                   = aws_ecs_task_definition.app.arn
  desired_count                     = var.desired_count
  launch_type                       = "FARGATE"
  health_check_grace_period_seconds = 60

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.app.arn
    container_name   = "app"
    container_port   = var.container_port
  }

  # The service can only register targets once the listener exists, and the
  # execution role must be ready for the task to pull the image.
  depends_on = [
    aws_lb_listener.http,
    aws_iam_role_policy.ecs_execution,
  ]

  # Avoid fighting with manual scaling (e.g. via the console or auto-scaling).
  lifecycle {
    ignore_changes = [desired_count]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-svc"
  }
}
