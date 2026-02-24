# RuuviGateway - Docker Publish

REGISTRY := ghcr.io/saavuori
TAG := latest

.PHONY: publish push-gateway

push-gateway:
	docker buildx build --platform linux/arm64 -t $(REGISTRY)/ruuvigateway:$(TAG) --push .

publish: push-gateway
	@echo "Done! Pull on Raspberry Pi with: docker compose pull"
