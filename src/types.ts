/**
 * Copyright EdgeCast, Licensed under the terms of the MIT license.
 * See LICENSE file in project root for terms.
 */

import { validateMetricName, validateLabelName } from "./utils.ts";
export type Labels = Record<string, string>;
export type Point = [number, number];
export type TimeSeries = Point[];
export const VALUE = 1;
export const TS = 0;
export const SUPRESS_HEADER = true;

export interface Stringy {
  toString(suppress?: boolean): string;
}

export abstract class Metric {
  public abstract toString(suppress?: boolean): string;
  public labels: Labels;
  public name: string;
  help: string;

  public getLabels(): Labels {
    return this.labels;
  }

  public getName(): string {
    return this.name;
  }

  constructor(name: string, labels: Labels = {}, help = "") {
    if (!validateMetricName(name)) {
      throw new Error(`Metric name ${name} is invalid.`);
    }

    const labelErrors: string[] = [];
    Object.keys(labels).forEach((name) => {
      if (!validateLabelName(name)) {
        labelErrors.push(`  ${name}`);
      }
    });

    if (labelErrors.length > 0) {
      labelErrors.unshift("Label names are invalid:");
      const result = labelErrors.join("\n");
      throw new Error(result);
    }

    this.name = name;
    this.labels = labels;
    this.help = help;
  }
}
