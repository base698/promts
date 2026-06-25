/**
 * Copyright EdgeCast, Licensed under the terms of the MIT license.
 * See LICENSE file in project root for terms.
 */

import {
  assertEquals,
  assertNotEquals,
} from "https://deno.land/std@0.71.0/testing/asserts.ts";
import { create, MetricsManager } from "./metricsmanager.ts";

Deno.test("metricsmanager", async (): Promise<void> => {
  for (let i = 0; i < 10; i++) {
    MetricsManager.getCounter("some_total").with({ instance: "myinstance" })
      .inc();
  }
  const someTotal = MetricsManager.getCounter("some_total").with({
    instance: "myinstance",
  });

  for (let i = 0; i < 15; i++) {
    MetricsManager.getCounter("some_total").with({
      instance: "myinstance",
      handler: "handler2",
    }).inc();
  }

  const newLabels = MetricsManager.getCounter("some_total").with({
    instance: "myinstance",
    handler: "handler2",
  });

  assertEquals(someTotal.getTotal(), 10);
  assertEquals(newLabels.getTotal(), 15);

  const someOtherTotal = MetricsManager.getCounter("some_other_total").with({
    instance: "myinstance",
    handler: "handler2",
  });

  assertEquals(someOtherTotal.getTotal(), 0);

  someOtherTotal.inc();
  assertEquals(someOtherTotal.getTotal(), 1);
});

Deno.test("metricscollection", async (): Promise<void> => {
  const someOtherColl = MetricsManager.getCounter("metrics_coll_total");
  const counter = someOtherColl.with({
    instance: "cache10.ama",
    handler: "handler2",
  });
  someOtherColl.with({ instance: "cache11.ama", handler: "handler2" }).inc();
  counter.inc();

  const expected = `# TYPE metrics_coll_total counter
metrics_coll_total{instance="cache10.ama",handler="handler2"} 1
metrics_coll_total{instance="cache11.ama",handler="handler2"} 1
`;

  assertEquals(someOtherColl.toString(), expected);
});

Deno.test("metricscollection get key for", async (): Promise<void> => {
  const someOtherColl = MetricsManager.getCounter("metrics_coll_total");

  const emptyResult = someOtherColl.getKeyFor({});
  const result1 = someOtherColl.getKeyFor({ x: "1", y: "2", instance: "10" });
  const result2 = someOtherColl.getKeyFor({ instance: "10", y: "2", x: "1" });
  const someOtherColl2 = MetricsManager.getCounter("metrics_coll_total");
  const emptyResult2 = someOtherColl2.getKeyFor({});

  assertEquals(result1, result2);
  assertNotEquals(emptyResult, result2);
  assertEquals(emptyResult, emptyResult2);
});

Deno.test("metricscollection gauge", async (): Promise<void> => {
  const someOtherColl = MetricsManager.getGauge("process_count");
  const gauge = someOtherColl.with({ instance: "cache10.ama" });
  someOtherColl.with({ instance: "cache11.ama" }).inc();
  someOtherColl.with({ instance: "cache11.ama" }).inc();
  someOtherColl.with({ instance: "cache11.ama" }).dec();
  gauge.inc();

  const expected = `# TYPE process_count gauge
process_count{instance="cache10.ama"} 1
process_count{instance="cache11.ama"} 1
`;

  assertEquals(someOtherColl.toString(), expected);
});

Deno.test("metricsmanager tostring", async (): Promise<void> => {
  const mm = create();
  const someOtherColl = mm.getCounter("metrics_coll_total");
  const counter = someOtherColl.with({ instance: "cache40.ama" });
  counter.inc();

  someOtherColl.with({ instance: "cache11.ama", handler: "handler2" }).inc();
  const expected = `# TYPE metrics_coll_total counter
metrics_coll_total{instance="cache40.ama"} 1
metrics_coll_total{instance="cache11.ama",handler="handler2"} 1
`;
  assertEquals(mm.toString(), expected);
});

Deno.test("metricsmanager includes gauges and summaries", async (): Promise<void> => {
  const mm = create();
  mm.getCounter("c_total").with({ a: "1" }).inc();
  mm.getGauge("g_count").with({ a: "1" }).inc();
  const s = mm.getSummary("lat_seconds").with({ a: "1" });
  s.observe(0.1);
  s.observe(0.2);

  const out = mm.toString();
  // gauges were previously dropped from toString()
  assertEquals(out.includes("# TYPE g_count gauge"), true);
  assertEquals(out.includes('g_count{a="1"} 1'), true);
  // summaries are now first-class in the manager
  assertEquals(out.includes("# TYPE lat_seconds summary"), true);
  assertEquals(out.includes('lat_seconds_count{a="1"} 2'), true);
  assertEquals(
    out.includes('lat_seconds_quantile{a="1",quantile="0.5"} 0.1'),
    true,
  );
});
