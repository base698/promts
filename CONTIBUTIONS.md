## Setup for contributions

### Get nvm to install node.js and npm

https://github.com/nvm-sh/nvm


### Get eslint

```bash
$ npm install --save-dev eslint typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

### Get deno

+ Install Deno: https://deno.land/manual/getting_started/installation

### Run the pushgateway
```
$ docker run -d -p 9091:9091 prom/pushgateway
```

### Run the tests
```
$ make test
```
