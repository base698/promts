import { Labels, Metric, SUPRESS_HEADER } from "./types.ts";
import { toStringLabels } from "./utils.ts";

/** Summary samples observations and exposes three things in the Prometheus
 *  text format:
 *
 *  - `<name>_sum`   — the running sum of all observed values
 *  - `<name>_count` — the number of observations
 *  - `<name>_quantile{quantile="φ"}` — the value at each configured φ-quantile
 *
 *  Quantiles are computed exactly over the retained observations using the
 *  nearest-rank method (no streaming approximation), so for the values that
 *  have been seen the reported quantile is an actual observed value.
 *
 *  ```ts
 *  const latency = new Summary("request_latency_seconds", {}, "", [0.5, 0.9, 0.99]);
 *  latency.observe(0.12);
 *  latency.observe(0.34);
 *  latency.getObserved(0.9); // 0.34
 *  ```
 */
export class Summary extends Metric {
  private objectives: number[];
  private observations: number[] = [];
  private sumValue = 0;
  private countValue = 0;

  constructor(
    name: string,
    labels: Labels = {},
    help = "",
    objectives: number[] = [0.5, 0.9, 0.99], // default quantiles
  ) {
    super(name, labels, help);
    this.objectives = [...objectives].sort((a, b) => a - b);
  }

  /** Sum of all observed values. */
  getSum(): number {
    return this.sumValue;
  }

  /** Number of observations recorded. */
  getCount(): number {
    return this.countValue;
  }

  /** Returns the value at one of the configured quantiles.
   *  Throws if the quantile is out of `[0, 1]` or is not one of the
   *  objectives this summary was constructed with. */
  getObserved(quantile: number): number {
    if (quantile < 0 || quantile > 1) {
      throw new Error(`quantile out of bounds: ${quantile}`);
    }
    if (!this.objectives.includes(quantile)) {
      throw new Error(`quantile not found: ${quantile}`);
    }
    return this.quantileValue(quantile);
  }

  /** Nearest-rank quantile over the retained observations. Returns 0 when
   *  nothing has been observed yet. */
  private quantileValue(quantile: number): number {
    const n = this.observations.length;
    if (n === 0) return 0;
    const sorted = [...this.observations].sort((a, b) => a - b);
    const rank = Math.min(n, Math.max(1, Math.ceil(quantile * n)));
    return sorted[rank - 1];
  }

  /** Record an observation. (The optional labels are accepted for call-site
   *  parity with the other metrics; a Summary carries the label set it was
   *  constructed with.) */
  observe(value: number, _labels: Labels = {}): void {
    this.observations.push(value);
    this.sumValue += value;
    this.countValue += 1;
  }

  /** Clear all observations, sum and count. */
  reset(): void {
    this.observations = [];
    this.sumValue = 0;
    this.countValue = 0;
  }

  toString(supress = !SUPRESS_HEADER): string {
    let result = "";
    if (!supress) {
      if (this.help != "") {
        result += `# HELP ${this.name} ${this.help}\n`;
      }
      result += `# TYPE ${this.name} summary\n`;
    }

    for (const quantile of this.objectives) {
      const labels = { ...this.labels, quantile: `${quantile}` };
      result += `${this.name}_quantile{${toStringLabels(labels)}} ${
        this.quantileValue(quantile)
      }\n`;
    }
    result += `${this.name}_sum{${
      toStringLabels(this.labels)
    }} ${this.sumValue}\n`;
    result += `${this.name}_count{${
      toStringLabels(this.labels)
    }} ${this.countValue}\n`;
    return result;
  }
}
