# promts

promts is a native TypeScript based implementation of promclient.  
Pronounced: Prom-tsss

## Usage

### Counters
Counters are monotonically increasing--counters never go down.  Think http request.
```ts
    import { MetricsManager } from 'https://deno.land/x/promts@v0.1.2
    const httpTotalRequests = MetricsManager.getCounter("http_requests_total")
      .with({ service: "web" });
    httpTotalRequests.inc();
```

### Gauges
Gauges can go up and down... Think water levels, temperature, thread counts.
```ts
    import { MetricsManager } from 'https://deno.land/x/promts@v0.1.2
    const processCount = MetricsManager.getGauge("process_count").with({app:"server"});
    processCount.inc(); // 1
    processCount.inc(3);
    processCount.dec(); 
    processCount.getTotal(); // 3

```

### Histogram
Histograms can be though of as a list of counters.  These counters each represent a bucket.  Buckets have a label `le` which denotes the upper bound.  Histograms also contain their sum and count.
```ts

    import { Histogram } from 'https://deno.land/x/promts@v0.1.2
    const histogram = new Histogram("http_request_duration");
    histogram.observe(0.01);
    histogram.observe(0.1);
    histogram.observe(5);
    histogram.observe(5);
    histogram.getCount(); // 4
    histogram.getSum();   // 10.11
    histogram.toString(); // dump to string

```

### Dumping the metrics in prometheus format
```ts
    import { MetricsManager } from 'https://deno.land/x/promts@v0.1.2
    const metricsData = MetricsManager.toString();
```

## Setup for contributions

### Get nvm to install node.js and npm

https://github.com/nvm-sh/nvm


### Get eslint

```bash
$ npm install --save-dev eslint typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

### Get deno

+ Install Deno: https://deno.land/manual/getting_started/installation


## Future Roadmap

+ Add support for configurable histogram buckets.
+ Add the summary metric type.

