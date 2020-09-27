import * as log from "https://deno.land/std@0.71.0/log/mod.ts";
import { Sha256 } from "https://deno.land/std@0.71.0/hash/sha256.ts";
import { Counter, Gauge, Histogram } from "../mod.ts";
import { pushMetrics } from "./pushgateway.ts";
import { Stringy, Labels, SUPRESS_HEADER } from "./types.ts";

/**
 * MetricsCollection is the abstract implementation of a metriccollection
 * of like type with different labels.
 * It groups metrics under the same header.
 *
 */
abstract class MetricCollection<T extends Stringy> {
    name: string;
    metrics: Record<string, T> = {};
    abstract metricType: string;
    abstract create(labels: Labels): T;

    constructor(name: string) {
        this.name = name;
    }

    toString(): string {
        let result = `# TYPE ${this.name} ${this.metricType}\n`;
        for (const [, v] of Object.entries(this.metrics)) {
            result = result.concat(v.toString(SUPRESS_HEADER));
        }
        return result;
    }

    getKeyFor(labels: Labels): string {
        const keys = Object.keys(labels);
        keys.sort();
        const hash = new Sha256();
        hash.update("__name__");
        hash.update(this.name);
        keys.forEach((k: string) => {
            hash.update(k);
            hash.update(`${labels[k]}`);
        });
        return hash.hex();
    }

    with(labels: Labels): T {
        const key = this.getKeyFor(labels);
        let metric = this.metrics[key];

        if (!metric) {
            metric = this.metrics[key] = this.create(labels);
        }

        return metric;
    }
}

class GaugeCollection extends MetricCollection<Gauge> {
    metricType = 'gauge'

    create(labels: Labels): Gauge {
        const metric: Gauge = new Gauge(
            this.name,
            labels
        );
        return metric;
    }
}

class CounterCollection extends MetricCollection<Counter> {
    metricType = 'counter'

    create(labels: Labels): Counter {
        const metric: Counter = new Counter(
            this.name,
            labels
        );
        return metric;
    }
}

class HistogramCollection extends MetricCollection<Histogram> {
    metricType = 'histogram'

    create(labels: Labels = {}): Histogram {
        const metric: Histogram = new Histogram(
            super.name,
            labels
        );

        return metric;
    }
}

/**
 * MetricsManagerImpl is the global store for all prometheus based metrics.
 * It offers convience methods for creating and looking up metrics by names
 * and by labels.
 */
class MetricsManagerImpl {
    private histogramColl: Record<string, MetricCollection<Histogram>>;
    private counterColl: Record<string, MetricCollection<Counter>>;
    private gaugeColl: Record<string, MetricCollection<Gauge>>;
    private intervalID: number;
    private names = new Set();

    constructor() {
        this.histogramColl = {};
        this.gaugeColl = {};
        this.counterColl = {};
        this.intervalID = -1;
    }

    initSystem() {
        // TODO: add system metrics
        // > Deno.metrics()
        // {
        //   opsDispatched: 13,
        //   opsDispatchedSync: 4,
        //   opsDispatchedAsync: 9,
        //   opsDispatchedAsyncUnref: 0,
        //   opsCompleted: 13,
        //   opsCompletedSync: 4,
        //   opsCompletedAsync: 9,
        //   opsCompletedAsyncUnref: 0,
        //   bytesSentControl: 373,
        //   bytesSentData: 0,
        //   bytesReceived: 789
        // }

    }


    terminate() {
        clearInterval(this.intervalID);
    }

    /**
     * Returns a gauge metric collection from global metric storage by name.
     * If the metric does not exist it will be created.
     *
     * ```ts
     * const gauge = MetricManager.getGauge("process_count").with({"service":"web"});
     * gauge.inc();
     * ```
     *
     * @param metric The source to copy from
     */
    getGauge(metric: string): GaugeCollection {
        let metricColl = this.gaugeColl[metric];

        if (!metricColl) {
            metricColl = this.gaugeColl[metric] = new GaugeCollection(metric);
            this.names.add(metric);
        }

        return metricColl;
    }

    getHistogram(metric: string): HistogramCollection {
        let metricColl = this.histogramColl[metric];

        if (!metricColl) {
            metricColl = this.histogramColl[metric] = new HistogramCollection(metric);
            this.names.add(metric);
        }

        return metricColl;
    }

    /**
     * Returns a counter metric collection from global metric storage by name.
     * If the metric does not exist it will be created.
     *
     * ```ts
     * const counter = MetricManager.getCounter("http_total_requests").with({"service":"web"});
     * counter.inc();
     * ```
     *
     * @param metric The source to copy from
     */
    getCounter(metric: string): CounterCollection {
        let metricColl = this.counterColl[metric];

        if (!metricColl) {
            metricColl = this.counterColl[metric] = new CounterCollection(metric);
            this.names.add(metric);
        }

        return metricColl;
    }

    /** Outputs all in memory metrics to a string.  To be used by `/metrics` or
     * or in pushing to a gateway.
     *
     * ```ts
     * const counter = MetricManager.getCounter("http_total_requests").with({"service":"web"});
     * counter.inc();
     * const metricsStr = counter.toString();
     * ```
     *
     * @param metric The source to copy from
     */
    toString(): string {
        let result = "";
        for (const [, v] of Object.entries(this.histogramColl)) {
            result = result.concat(v.toString());
        }

        for (const [, v] of Object.entries(this.counterColl)) {
            result = result.concat(v.toString());
        }

        return result;
    }

    initMetricsPush() {
        this.intervalID = setInterval(() => {
            log.debug("initMetricsPush has started");
            pushMetrics(this.toString());
        }, 5000);
    }

}

export const MetricsManager = new MetricsManagerImpl();
export const create: () => MetricsManagerImpl = () => new MetricsManagerImpl();
