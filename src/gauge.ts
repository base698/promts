/**
 * Copyright EdgeCast, Licensed under the terms of the MIT license.
 * See LICENSE file in project root for terms.
 */

import { Metric, SUPRESS_HEADER, Labels } from "./types.ts";
import { toStringLabels } from "./utils.ts";

export class Gauge extends Metric {
  private total = 0;

  constructor(name: string, labels: Labels = {}, help = "") {
    super(name, labels, help);
  }

  getTotal(): number {
    return this.total;
  }

  reset(): number {
    this.total = 0;
    return this.getTotal();
  }

  inc(n = 1): number {
    this.total += n;
    return this.total;
  }

  dec(n = 1): number {
    this.total -= n;
    return this.total;
  }

  toString(supress = SUPRESS_HEADER): string {
    let result = "";
    if (!supress) {
      if (this.help != "") {
        result += `# HELP ${this.name} ${this.help}\n`;
      }

      result += `# TYPE ${this.name} gauge\n`;
    }

    result += `${this.name}{${toStringLabels(this.labels)}} ${this.total}\n`;
    return result;
  }
}
