# RuuviGateway - Docker Publish

REGISTRY := ghcr.io/saavuori
TAG := latest

.PHONY: publish push-gateway push-matter

push-gateway:
	docker buildx build --platform linux/arm64 -t $(REGISTRY)/ruuvigateway:$(TAG) --push .

push-matter:
	cd matter-bridge && docker buildx build --platform linux/arm/v7,linux/arm64 -t $(REGISTRY)/ruuvigateway-matter-bridge:$(TAG) --push .

publish: push-gateway push-matter
	@echo "Done! Pull on Raspberry Pi with: docker compose pull"
