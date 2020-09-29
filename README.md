---
id: promts
title: README
sidebar_label: README
---

# promts

promts is a native TypeScript based implementation of promclient. Create Prometheus compatible metrics for your TypeScript/Deno Service.

Pronounced: Prom-tsss

## Table of Contents

- [Background](#background)
- [Install](#install)
- [Usage](#usage)
- [Contribute](#contribute)
- [License](#license)

## Background

 Since no current TypeScript Native implementation for Node.JS or Deno seemed to exist, promts fills the gap. This allows for your TypeScript code to have type checking on the promclient types.

## Install

### Usage from Deno

```ts
    import { MetricsManager } from 'https://deno.land/x/promts@v0.1.4
```

## Usage

### Counters
Counters are monotonically increasing--counters never go down.  Think http request.
```ts
    import { MetricsManager } from 'https://deno.land/x/promts@v0.1.3
    const httpTotalRequests = MetricsManager.getCounter("http_requests_total")
      .with({ service: "web" });
    httpTotalRequests.inc();
```

### Gauges
Gauges can go up and down... Think water levels, temperature, thread counts.
```ts
    import { MetricsManager } from 'https://deno.land/x/promts@v0.1.3
    const processCount = MetricsManager.getGauge("process_count").with({app:"server"});
    processCount.inc(); // 1
    processCount.inc(3);
    processCount.dec();
    processCount.getTotal(); // 3

```

### Histogram
Histograms can be though of as a list of counters.  These counters each represent a bucket.  Buckets have a label `le` which denotes the upper bound.  Histograms also contain their sum and count.
```ts

    import { Histogram } from 'https://deno.land/x/promts@v0.1.3
    const histogram = new Histogram("http_request_duration");
    histogram.observe(0.01);
    histogram.observe(0.1);
    histogram.observe(5);
    histogram.observe(5);
    histogram.getCount(); // 4
    histogram.getSum();   // 10.11
    histogram.toString(); // dump to string

```

### Pushgateway
```ts
    const pushgateway = new PushGateway("test_job");
    pushgateway.sendOnInterval(MetricsManager);
```

### Dumping the metrics in prometheus format
```ts
    import { MetricsManager } from 'https://deno.land/x/promts@v0.1.3
    const metricsData = MetricsManager.toString();
```

## Contribute

Please refer to [CONTRIBUTIONS.md](CONTRIBUTIONS.md) for information about how to get involved. We welcome issues, questions, and pull requests.

## Maintainers
- Justin Thomas: jthomas@vdms.com

## License
- This project is licensed under the terms of the [MIT](LICENSE) open source license. Please refer to [LICENSE](LICENSE) for the full terms.


## Future Roadmap

+ Add support for configurable histogram buckets.
+ Add the summary metric type.
