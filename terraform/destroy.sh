#!/usr/bin/env bash
#
# destroy.sh — Tear down the S3 static website infrastructure.
#
# This will:
#   1. Empty the S3 bucket (required before Terraform can delete it)
#   2. Run terraform destroy to remove all resources
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "WARNING: This will destroy the frontend S3 bucket."
echo
read -r -p "Are you sure? [y/N] " ans
[[ "$ans" =~ ^[Yy]$ ]] || { echo "Aborted."; exit 0; }

BUCKET="$(terraform output -raw s3_bucket_name 2>/dev/null)" || true
if [ -n "$BUCKET" ]; then
  echo "==> Emptying S3 bucket: $BUCKET..."
  aws s3 rm "s3://$BUCKET" --recursive 2>/dev/null || true

  # Also delete old versions if versioning was enabled
  aws s3api list-object-versions \
    --bucket "$BUCKET" \
    --query 'Versions[].{Key:Key,VersionId:VersionId}' \
    --output json 2>/dev/null | \
    jq -r '.[] | "--key \(.Key) --version-id \(.VersionId)"' 2>/dev/null | \
    while read -r args; do
      eval aws s3api delete-object --bucket "$BUCKET" $args 2>/dev/null || true
    done

  # Delete markers too
  aws s3api list-object-versions \
    --bucket "$BUCKET" \
    --query 'DeleteMarkers[].{Key:Key,VersionId:VersionId}' \
    --output json 2>/dev/null | \
    jq -r '.[] | "--key \(.Key) --version-id \(.VersionId)"' 2>/dev/null | \
    while read -r args; do
      eval aws s3api delete-object --bucket "$BUCKET" $args 2>/dev/null || true
    done
fi

echo "==> terraform destroy..."
terraform destroy -auto-approve

echo
echo "==> Done. Frontend infrastructure has been destroyed."
