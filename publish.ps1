# RuuviGateway - Docker Publish Script

$REGISTRY = "ghcr.io/saavuori"
$TAG = "latest"

Write-Host "Building and pushing gateway..." -ForegroundColor Cyan
docker buildx build --platform linux/arm64 -t "$REGISTRY/ruuvigateway:$TAG" --push .

Write-Host "Building and pushing matter bridge..." -ForegroundColor Cyan
Set-Location matter-bridge
docker buildx build --platform linux/arm64 -t "$REGISTRY/ruuvigateway-matter-bridge:$TAG" --push .
Set-Location ..

Write-Host "`nDone! Pull on Raspberry Pi with: docker compose pull" -ForegroundColor Green
