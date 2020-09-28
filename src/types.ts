import { validateMetricName, validateLabelName } from './utils.ts';
export type Labels = Record<string, string>;
export type Point = [number, number];
export type TimeSeries = Point[];
export const VALUE = 1;
export const TS = 0;
export const SUPRESS_HEADER = true;

export interface Stringy {
    toString(suppress?: boolean): string
}

export abstract class Metric {
    labels: Labels;
    name: string;
    help: string;

    constructor(name: string, labels: Labels = {}, help = '') {
        if (!validateMetricName(name)) {
            throw new Error(`Metric name ${name} is invalid.`)
        }

        const labelErrors: string[] = [];
        Object.keys(labels).forEach(name => {
            if (!validateLabelName(name)) {
                labelErrors.push(`  ${name}`);
            }
        });

        if (labelErrors.length > 0) {
            labelErrors.unshift('Label names are invalid:');
            const result = labelErrors.join('\n');
            throw new Error(result);
        }

        this.name = name;
        this.labels = labels;
        this.help = help;
    }

}
