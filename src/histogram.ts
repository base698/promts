/**
 * Copyright Verizon Media, Licensed under the terms of the MIT license.
 * See LICENSE file in project root for terms.
 */

import { Counter } from '../mod.ts';
import { Metric, SUPRESS_HEADER, Labels } from './types.ts';

// 50  100  200  400  600 1000 ... ms
const defaultBuckets = [0.1, 0.2, 0.4, 0.6, 1, 3, 8, 20, 60, 120];

export class Histogram extends Metric {
    private buckets: number[];
    private counters: Counter[];
    private sum: Counter;
    private count: Counter;

    constructor(
        name: string,
        labels: Labels = {},
        help = '',
        buckets: number[] = defaultBuckets
    ) {
        super(name, labels, help);
        this.buckets = buckets;
        this.sum = new Counter(name + "_sum");
        this.count = new Counter(name + "_count");
        const bucketName = name + "_bucket";

        this.counters = buckets.map((n) => {
            const clonedLabels = { ...labels };
            clonedLabels["le"] = `${n}`;
            return new Counter(bucketName, clonedLabels);
        });

        const clonedLabels = { ...labels };
        clonedLabels["le"] = `+Inf`;
        this.counters.push(new Counter(bucketName, clonedLabels));
    }

    getSum(): number {
        return this.sum.getTotal();
    }

    getCount(): number {
        return this.count.getTotal();
    }

    getObserved(n: number): number {
        if (n < 0 || n >= this.counters.length) {
            throw new Error(`bucket number out of bounds: ${n} ${this.buckets}`);
        }

        return this.counters[n].getTotal();
    }

    observe(value: number): void {
        this.sum.inc(value);
        this.count.inc();

        for (let i = 0; i < this.buckets.length; i++) {
            if (value <= this.buckets[i]) {
                this.counters[i].inc();
                return;
            }
        }
        this.counters.slice(-1)[0].inc();
    }

    reset(): void {
        this.count.reset();
        this.sum.reset();
        this.counters.forEach((counter: Counter) => counter.reset());
    }

    getLabels(): Labels {
        return this.labels;
    }

    toString(supress = !SUPRESS_HEADER): string {
        let result = "";
        if (!supress) {
            if (this.help != '') {
                result += `# HELP ${this.name} ${this.help}\n`;
            }

            result += `# TYPE ${this.name} histogram\n`;
        }

        result += this.counters
            .map((counter: Counter) => counter.toString())
            .join('');
        result += this.sum.toString();
        result += this.count.toString();
        return result;
    }
}
