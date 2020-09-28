lint:
	@node_modules/eslint/bin/eslint.js . --ext .ts

test:
	@deno test --allow-net=:9091 --allow-env src/
