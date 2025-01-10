import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.71.0/testing/asserts.ts";
import { Summary } from "./summary.ts";

/**
 * This test suite is for validating the functionality of the Summary class.
 *
 * It includes tests to ensure that:
 * - Observations are correctly added to the summary.
 * - The summary accurately records the sum and count of observations.
 * - Attempts to access invalid quantiles throw errors.
 * - The summary's string representation matches the expected Prometheus format output.
 */
Deno.test("Summary", async (): Promise<void> => {
  const summary = new Summary("service_latency_seconds");

  summary.observe(0.1, { service: "database" });
  summary.observe(0.5, { service: "database" });
  summary.observe(0.2, { service: "database" });

  assertEquals(summary.getCount(), 3);
  assertEquals(summary.getSum(), 0.8);

  // Quantile checks could be more elaborate if quantile logic is implemented.
  assertThrows(
    () => summary.getObserved(0.98),
    Error,
    "quantile not found: 0.98",
  );
});

Deno.test("Summary toString()", async (): Promise<void> => {
  const summary = new Summary(
    "service_latency_seconds",
    {},
    "",
    [0.5, 0.9, 0.99],
  );

  summary.observe(0.1, { service: "database" });
  summary.observe(0.5, { service: "database" });
  summary.observe(0.2, { service: "database" });

  const expected = `# TYPE service_latency_seconds summary
service_latency_seconds_quantile{quantile="0.5"} 0
service_latency_seconds_quantile{quantile="0.9"} 0
service_latency_seconds_quantile{quantile="0.99"} 0
service_latency_seconds_sum{} 0.8
service_latency_seconds_count{} 3
`;

  assertEquals(summary.toString(), expected);
});
