#!/usr/bin/env bash
#
# deploy.sh — Build and deploy the Billetera Digital frontend to AWS.
#
# What it does (in order):
#   1. terraform apply  → creates the infra (VPC, ALB, ECR, ECS, ...)
#   2. docker build     → builds the image from the repo-root Dockerfile
#   3. docker push      → pushes it to ECR
#   4. force new deploy → makes the ECS service pull and run the new image
#   5. prints the app URL
#
# Usage:
#   ./deploy.sh                     # IMAGE_TAG=latest, region from AWS config
#   IMAGE_TAG=v1.2.3 ./deploy.sh    # pin a specific tag
#   AWS_REGION=us-east-2 ./deploy.sh
#
# Cost: ~USD 30-35/month while the infra is up. Run ./destroy.sh when finished.
#
set -euo pipefail

# --- paths & config ---------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"   # repo root (where the Dockerfile lives)
REGION="${AWS_REGION:-us-east-1}"
TAG="${IMAGE_TAG:-latest}"

cd "$SCRIPT_DIR"

# --- prerequisites ----------------------------------------------------------
echo "==> Checking prerequisites..."
for cmd in terraform aws docker; do
  command -v "$cmd" >/dev/null 2>&1 || {
    echo "ERROR: '$cmd' is not installed or not in PATH." >&2; exit 1; }
done
ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text 2>/dev/null)" || {
  echo "ERROR: not authenticated to AWS. Run 'aws configure' or set credentials." >&2; exit 1; }

# --- confirm (this spends money) --------------------------------------------
echo
echo "WARNING: this will create real AWS resources in account $ACCOUNT_ID (${REGION})."
echo "Estimated cost while up: ~USD 30-35/month (NAT Gateway + ALB dominate)."
echo "Run ./destroy.sh when you're done to stop billing."
echo
read -r -p "Continue? [y/N] " ans
[[ "$ans" =~ ^[Yy]$ ]] || { echo "Aborted. Nothing was created."; exit 0; }

# --- 1. terraform apply -----------------------------------------------------
echo "==> terraform apply (app_image_tag=$TAG)..."
terraform init -input=false
terraform apply -auto-approve -var "app_image_tag=$TAG"

# --- 2. ECR login + build + push --------------------------------------------
ECR_URI="$(terraform output -raw ecr_repository_uri)"
echo "==> Logging into ECR ($ECR_URI)..."
aws ecr get-login-password --region "$REGION" \
  | docker login --username AWS --password-stdin "$ECR_URI"

echo "==> Building image $ECR_URI:$TAG (context: $ROOT_DIR)..."
docker build -t "$ECR_URI:$TAG" "$ROOT_DIR"

echo "==> Pushing image to ECR..."
docker push "$ECR_URI:$TAG"

# --- 3. force a new deployment so the service runs the new image ------------
CLUSTER="$(terraform output -raw ecs_cluster_name)"
SERVICE="$(terraform output -raw ecs_service_name)"
echo "==> Triggering a new deployment (cluster=$CLUSTER service=$SERVICE)..."
aws ecs update-service \
  --cluster "$CLUSTER" --service "$SERVICE" \
  --force-new-deployment >/dev/null

# --- 4. show the URL --------------------------------------------------------
URL="$(terraform output -raw app_url)"
echo
echo "==> Deployed. App URL: $URL"
echo "    Tasks take ~1-2 min to become healthy after the image is pushed."
echo "    Check status:  aws ecs describe-services --cluster $CLUSTER --services $SERVICE --query 'services[0].tasks[].lastStatus'"
