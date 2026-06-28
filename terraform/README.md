# Terraform — Billetera Digital frontend (ECS Fargate)

Provisions the AWS infrastructure to run the containerized Next.js frontend
(`Dockerfile`, `output: standalone`) on **ECS Fargate**, behind a public
**Application Load Balancer**, pulling the image from **ECR**.

> Scope: frontend only. No HTTPS / ACM / Route 53 / custom domain. Backend is
> out of scope and is configured via the `BACKEND_URL` variable.

## Architecture

```
Internet ──► ALB (public subnets, port 80) ──► ECS Fargate tasks (private subnets)
                                                      │
                        ECR (image source) ◄────────┤ pulls image
                                                      └──► CloudWatch Logs
```

- **VPC** `10.0.0.0/16` — 2 AZs, 2 public + 2 private subnets.
- **NAT Gateway** (single, in the first public subnet) so private tasks can
  reach ECR and the backend. Single NAT chosen to minimize cost.
- **ALB** internet-facing, HTTP/80, health check on `/`.
- **ECS service** Fargate, `awsvpc` networking, IP target group.
- **ECR** with scan-on-push + lifecycle policy (keep last 5 tagged images).

## Prerequisites

- AWS credentials configured (e.g. `aws configure` — IAM user with enough
  permissions to create VPC/ECS/ECR/IAM/ELB/CloudWatch resources).
- [Terraform](https://developer.hashicorp.com/terraform/downloads) >= 1.5.
- [Docker](https://docs.docker.com/get-docker/) + [AWS CLI v2](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html).
- Region: `us-east-1` (override with `-var aws_region=...`).

## Deploy

All commands run from the `terraform/` directory.

### 1. Provision the infrastructure

```bash
terraform init
terraform plan
terraform apply
```

`apply` prints the outputs, including `ecr_repository_uri`, `alb_dns_name` and
`app_url`.

### 2. Build and push the Docker image

> **Order matters:** the ECS service is created during `apply`, but its tasks
> will stay `PENDING` until an image with the configured tag exists in ECR.
> Push the image **right after** the first `apply`.

Use the `ecr_repository_uri` output (e.g. `324486142059.dkr.ecr.us-east-1.amazonaws.com/billetera-dev`):

```bash
ECR_URI=$(terraform output -raw ecr_repository_uri)

# Log the Docker daemon into ECR
aws ecr get-login-password --region us-east-1 \
  | docker login --username AWS --password-stdin "$ECR_URI"

# Build and push (run from the repo root, where the Dockerfile lives)
docker build -t "$ECR_URI:latest" .
docker push "$ECR_URI:latest"
```

If you changed the tag via `-var app_image_tag=v1`, build/push with that tag.

### 3. Access the app

Once a task is `RUNNING` and the target group health check passes:

```bash
terraform output -raw app_url
```

Open the printed URL in your browser (HTTP only — no TLS in scope).

### 4. Tear down (stop billing)

```bash
terraform destroy
```

The NAT Gateway and ALB are the main cost drivers — destroying when idle is the
single most effective way to avoid surprises.

## Variables

| Variable          | Default     | Description                                            |
| ----------------- | ----------- | ------------------------------------------------------ |
| `aws_region`      | `us-east-1` | AWS region.                                            |
| `project_name`    | `billetera` | Resource prefix.                                       |
| `environment`     | `dev`       | Environment name.                                      |
| `container_port`  | `3000`      | In-container port (Next.js standalone `server.js`).    |
| `app_image_tag`   | `latest`    | Docker image tag to deploy.                            |
| `task_cpu`        | `256`       | Fargate CPU units.                                     |
| `task_memory`     | `512`       | Fargate memory (MiB). Must be a valid cpu/mem combo.   |
| `desired_count`   | `1`         | Number of tasks.                                       |
| `backend_url`     | `""`        | Backend API base URL, forwarded as `BACKEND_URL`.      |

Override with `-var key=value` or a `terraform.tfvars` file (never commit
secrets to tfvars — it is gitignored).

## Notes / gotchas

- **Next.js standalone binding:** the container sets `HOSTNAME=0.0.0.0` so
  `server.js` binds to all interfaces. Without it the process listens only on
  `127.0.0.1` and the ALB health check never succeeds.
- **Fargate CPU/memory:** 256 CPU / 512 MiB is the smallest valid combo.
- **ECR login quirk:** `ecr:GetAuthorizationToken` only supports `Resource: "*"`
  (an AWS limitation), so it is split from the repo-scoped pull permissions.
- **Single NAT:** both private subnets route through one NAT Gateway — fine for
  dev, not HA. Add a NAT per AZ for production.
