# -----------------------------------------------------------------------------
# ALB — public-facing Application Load Balancer that fronts the ECS service
# -----------------------------------------------------------------------------

resource "aws_lb" "this" {
  name               = "${var.project_name}-${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  tags = {
    Name = "${var.project_name}-${var.environment}-alb"
  }
}

# Fargate tasks use awsvpc networking, so the target group must be ip-based.
resource "aws_lb_target_group" "app" {
  name        = "${var.project_name}-${var.environment}-tg"
  target_type = "ip"
  port        = var.container_port
  protocol    = "HTTP"
  vpc_id      = aws_vpc.this.id

  health_check {
    enabled             = true
    path                = "/"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    matcher             = "200"
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-tg"
  }
}

# HTTP listener (no HTTPS/ACM in scope) — forwards to the target group.
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.this.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-http-listener"
  }
}
