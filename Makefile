lint:
	@node_modules/eslint/bin/eslint.js . --ext .ts

test:
	@deno test --allow-net --allow-env src/
