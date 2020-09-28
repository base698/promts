import { Metric, SUPRESS_HEADER, TimeSeries, Labels } from './types.ts';
import { toStringLabels } from './utils.ts';

/** Counter is a monotonically increasing value. `counter.inc()` increases
 * the value by 1.  Adding a number into `inc()` causes it to increase by
 * that amount. */
export class Counter extends Metric {
    private total = 0;

    constructor(name: string, labels: Labels = {}, help = '') {
        super(name, labels, help);
    }

    getLabels(): Labels {
        return super.labels;
    }

    /** Returns current value of the counter.
     * ```ts
     * const curr = counter.getTotal();
     * ```
    */
    getTotal(): number {
        return this.total;
    }

    getName(): string {
        return super.name;
    }

    /** Resets the counter to zero.  Unlikely to be needed.
     *
     * ```ts
     * const curr = counter.reset();
     * ```
    */
    reset(): number {
        this.total = 0;
        return this.getTotal();
    }

    /** Increment the counter.
     *
     * ```ts
     * counter.inc();
     * ```
     * @param n the amount to increase the counter by.
    */
    inc(n = 1): number {
        if (n <= 0) {
            throw new Error("value <= 0");
        }

        this.total += n;
        return this.total;
    }

    /** Output the string representation in prometheus format of this
     *  counter.
     *
     * ```ts
     * counter.inc();
     * ```
     * @param n the amount to increase the counter by.
    */
    toString(supress = SUPRESS_HEADER): string {
        let result = '';
        if (!supress) {
            if (this.help != '') {
                result += `# HELP ${this.name} ${this.help}\n`;
            }

            result += `# TYPE ${this.name} counter\n`;
        }

        result += `${this.name}{${toStringLabels(this.labels)}} ${this.total}\n`;
        return result;
    }
}


export class HistoryCounter {
    private timeSeriesRecord: TimeSeries;
    private staticLabelsStr: string;
    private historyLimit: number;
    private counter: Counter;

    constructor(
        name: string,
        labels: Labels = {},
        historyLimit = 100,
    ) {
        this.counter = new Counter(name, labels);
        this.staticLabelsStr = toStringLabels(labels);

        this.timeSeriesRecord = [];
        this.historyLimit = historyLimit;
    }

    inc(v = 1): void {
        this.counter.inc(v);
        const current = this.counter.getTotal();

        const record: [number, number] = [Date.now(), current];
        this.timeSeriesRecord.push(record);
        if (this.timeSeriesRecord.length > this.historyLimit) {
            this.timeSeriesRecord.shift();
        }

    }

    reset(): void {
        this.counter.reset();
        this.timeSeriesRecord = [];
    }

    getStaticLabels(): string {
        return `{${this.staticLabelsStr}}`;
    }

    getLabels(): Labels {
        return this.counter.getLabels();
    }

    getTotal(): number {
        return this.counter.getTotal();
    }

    toString(): string {
        return this.counter.toString();
    }
}
