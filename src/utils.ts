/**
 * Copyright EdgeCast, Licensed under the terms of the MIT license.
 * See LICENSE file in project root for terms.
 */

import type { Labels } from './types.ts';

export function toStringLabels(labels: Labels): string {
    return Object.keys(labels)
        .map((k: string) => `${k}="${labels[k]}"`)
        .join(",");
}


const metricRegexp = /^[a-zA-Z_:][a-zA-Z0-9_:]*$/;
/**
 * Validate prometheus metric name.
 *
 * @param name the prometheus name to be tested.
 */
export function validateMetricName(name: string): boolean {
    return metricRegexp.test(name);
}


const labelRegexp = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
/**
 * Validate prometheus label name.
 *
 * @param name the label name to be tested.
 */
export function validateLabelName(name: string): boolean {
    return labelRegexp.test(name);
}
