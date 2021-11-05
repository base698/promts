/**
 * Copyright EdgeCast, Licensed under the terms of the MIT license.
 * See LICENSE file in project root for terms.
 */

import { assertEquals } from "https://deno.land/std@0.71.0/testing/asserts.ts";
import { Histogram } from "./histogram.ts";

Deno.test("Histogram", async (): Promise<void> => {
    // Buckets: [0.01, 0.1, 0.2, 0.4, 0.6, 1, 3, 8, 20, 60, 120, +Inf];
    const histogram = new Histogram("http_request_duration");
    histogram.observe(0.01);
    histogram.observe(0.1);
    histogram.observe(5);
    histogram.observe(5);
    assertEquals(histogram.getCount(), 4);
    assertEquals(histogram.getSum(), 10.11);

    histogram.observe(300);
    histogram.observe(300);
    assertEquals(histogram.getObserved(11), 6); // le=+Inf
    histogram.observe(50);
    histogram.observe(50);
    histogram.observe(50);
    histogram.observe(50);
    assertEquals(histogram.getObserved(9), 8); // le=60
    assertEquals(histogram.getObserved(8), 4); // le=20
});


Deno.test("Histogram toString()", async (): Promise<void> => {
    const histogram = new Histogram("http_request_duration");
    histogram.observe(0.01);
    histogram.observe(0.1);
    histogram.observe(5);
    histogram.observe(5);

    histogram.observe(300);
    histogram.observe(300);

    histogram.observe(50);
    histogram.observe(50);
    histogram.observe(50);
    histogram.observe(50);

    const expected = `# TYPE http_request_duration histogram
http_request_duration_bucket{le="0.01"} 1
http_request_duration_bucket{le="0.1"} 2
http_request_duration_bucket{le="0.2"} 2
http_request_duration_bucket{le="0.4"} 2
http_request_duration_bucket{le="0.6"} 2
http_request_duration_bucket{le="1"} 2
http_request_duration_bucket{le="3"} 2
http_request_duration_bucket{le="8"} 4
http_request_duration_bucket{le="20"} 4
http_request_duration_bucket{le="60"} 8
http_request_duration_bucket{le="120"} 8
http_request_duration_bucket{le="+Inf"} 10
http_request_duration_sum{} 810.11
http_request_duration_count{} 10
`;

    assertEquals(histogram.toString(), expected);
});
