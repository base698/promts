import { Counter } from "../mod.ts";
import { Metric, SUPRESS_HEADER, Labels } from "./types.ts";

export class Summary extends Metric {
  private quantiles: Counter[];
  private sum: Counter;
  private count: Counter;

  constructor(
    name: string,
    labels: Labels = {},
    help = "",
    objectives: number[] = [0.5, 0.9, 0.99], // default quantiles
  ) {
    super(name, labels, help);
    this.sum = new Counter(name + "_sum", labels);
    this.count = new Counter(name + "_count", labels);
    const quantileName = name + "_quantile";

    this.quantiles = objectives.map((quantile) => {
      const clonedLabels = { ...labels };
      clonedLabels["quantile"] = `${quantile}`;
      return new Counter(quantileName, clonedLabels);
    });
  }

  getSum(): number {
    return this.sum.getTotal();
  }

  getCount(): number {
    return this.count.getTotal();
  }

  getObserved(quantile: number): number {
    if (quantile < 0 || quantile > 1) {
      throw new Error(`quantile out of bounds: ${quantile}`);
    }

    const index = this.quantiles.findIndex(
      (q) => q.getLabels().quantile === `${quantile}`,
    );
    if (index === -1) throw new Error(`quantile not found: ${quantile}`);

    return this.quantiles[index].getTotal();
  }

  observe(value: number, labels: Labels): void {
    this.sum.inc(value);
    this.count.inc();

    // Implement logic for recording values into quantiles
    // Since quantiles' logic calculation is more complex, typically you use
    // a library that implements this logic, such as the CKMS algorithm or similar.
    // In this simple version, we will skip the detailed quantile calculation.
  }

  reset(): void {
    this.count.reset();
    this.sum.reset();
    this.quantiles.forEach((quantile: Counter) => quantile.reset());
  }

  toString(supress = !SUPRESS_HEADER): string {
    let result = "";
    if (!supress) {
      if (this.help != "") {
        result += `# HELP ${this.name} ${this.help}\n`;
      }

      result += `# TYPE ${this.name} summary\n`;
    }

    result += this.quantiles
      .map((quantile: Counter) => quantile.toString())
      .join("");
    result += this.sum.toString();
    result += this.count.toString();
    return result;
  }
}
