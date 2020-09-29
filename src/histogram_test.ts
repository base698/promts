/**
 * Copyright Verizon Media, Licensed under the terms of the MIT license.
 * See LICENSE file in project root for terms.
 */

import { assertEquals } from "https://deno.land/std@0.71.0/testing/asserts.ts";
import { Histogram } from "./histogram.ts";

Deno.test("Histogram", async (): Promise<void> => {
    const histogram = new Histogram("http_request_duration");
    histogram.observe(0.01);
    histogram.observe(0.1);
    histogram.observe(5);
    histogram.observe(5);
    assertEquals(histogram.getCount(), 4);
    assertEquals(histogram.getSum(), 10.11);

    histogram.observe(300);
    histogram.observe(300);
    assertEquals(histogram.getObserved(10), 2);
    histogram.observe(50);
    histogram.observe(50);
    histogram.observe(50);
    histogram.observe(50);
    assertEquals(histogram.getObserved(8), 4);
    assertEquals(histogram.getObserved(7), 0);

});

Deno.test("Histogram toString()", async (): Promise<void> => {
    const histogram = new Histogram("http_request_duration");
    histogram.observe(50);
    const expected = `# TYPE http_request_duration histogram
http_request_duration_bucket{le="0.1"} 0
http_request_duration_bucket{le="0.2"} 0
http_request_duration_bucket{le="0.4"} 0
http_request_duration_bucket{le="0.6"} 0
http_request_duration_bucket{le="1"} 0
http_request_duration_bucket{le="3"} 0
http_request_duration_bucket{le="8"} 0
http_request_duration_bucket{le="20"} 0
http_request_duration_bucket{le="60"} 1
http_request_duration_bucket{le="120"} 0
http_request_duration_bucket{le="+Inf"} 0
http_request_duration_sum{} 50
http_request_duration_count{} 1
`;

    assertEquals(histogram.toString(), expected);
});
