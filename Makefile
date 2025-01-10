PUSHGW_CONTAINER_NAME ?= pushgateway

.PHONY: help
help: ## Display this help screen (default)
	@grep -h -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

lint: ## linting
	@node_modules/eslint/bin/eslint.js . --ext .ts

test: stop-pg run-pg ## runs the tests
	@deno test --allow-net=:9091 --allow-env src/
test:
	@deno test --allow-net --allow-env src/

run-pg: ## brings up pushgateway container
	docker run --name ${PUSHGW_CONTAINER_NAME} -d -p 9091:9091 prom/pushgateway:latest

stop-pg: ## stops pushgateway container
	docker stop ${PUSHGW_CONTAINER_NAME} || true && docker rm ${PUSHGW_CONTAINER_NAME} || true

