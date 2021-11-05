/**
 * Copyright EdgeCast, Licensed under the terms of the MIT license.
 * See LICENSE file in project root for terms.
 */

import { delay } from "https://deno.land/std@0.99.0/async/delay.ts";
import { assertEquals,assertArrayIncludes } from "https://deno.land/std@0.99.0/testing/asserts.ts";
import { PushGateway } from "./pushgateway.ts";
import { PUSHGATEWAY_HOST } from "./config.ts";
import { MockResponse, MockFetch } from "./mocks.ts";
import { create } from "./metricsmanager.ts";


Deno.test("pushgateway send", async (): Promise<void> => {
    const pushgateway = new PushGateway("test_job");
    const payload = `# TYPE metrics_coll_total counter
metrics_coll_total{instance="cache10.ama",handler="handler2"} 4
`
    await pushgateway.send(payload);

    const response = await fetch(
        `http://${PUSHGATEWAY_HOST}/metrics`,
        {
            method: "GET"
        },
    );

    const expected = [`metrics_coll_total{handler="handler2",instance="cache10.ama",job="test_job"} 4`];
    const responseBody = await response.text();
    const splitArr = responseBody.split('\n')
    assertArrayIncludes(splitArr, expected);

});


Deno.test("pushgateway metricsmanager", async (): Promise<void> => {
    const pushgateway = new PushGateway("test_job");

    const mm = create();
    const someOtherColl = mm.getCounter("counter_total");
    const counter = someOtherColl.with({ instance: "cache40.ama" });
    counter.inc();
    counter.inc(5);

    await pushgateway.send(mm.toString());

    const response = await fetch(
        `http://${PUSHGATEWAY_HOST}/metrics`,
        {
            method: "GET"
        },
    );
    const responseBody = await response.text();
    const expected = [`counter_total{instance="cache40.ama",job="test_job"} 6`];
    const splitArr = responseBody.split('\n')
    assertArrayIncludes(splitArr, expected);

});

const THROW_EXCEPTION = true;

Deno.test("pushgateway sendOnInterval", async (): Promise<void> => {
    const mockFetch = new MockFetch("test body",200);

    const INTERVAL = 200;
    const pushgateway = new PushGateway("test_job", "localhost:9091", INTERVAL, "http", "",mockFetch.fetch);

    const mm = create();
    const someOtherColl = mm.getCounter("counter_total");
    const counter = someOtherColl.with({ instance: "cache40.ama" });
    counter.inc();
    counter.inc(5);

    // Wait 1 second and ensure called 5 times.
    pushgateway.sendOnInterval(mm);
    await delay(1100);
    pushgateway.clearInterval();
    assertEquals(mockFetch.numCalls, 5, "didn't call fetch");
});


Deno.test("pushgateway doRequest backoff", async (): Promise<void> => {
    const mockFetch = new MockFetch("test body",500,THROW_EXCEPTION);

    const pushgateway = new PushGateway("test_job", "localhost:9091", 100, "http", "",mockFetch.fetch);

    const mm = create();
    const someOtherColl = mm.getCounter("counter_total");
    const counter = someOtherColl.with({ instance: "cache40.ama" });
    counter.inc();
    counter.inc(5);

    pushgateway.sendOnInterval(mm);
    await delay(5000);
    pushgateway.clearInterval();

    assertEquals(mockFetch.numCalls, 2, "didn't call fetch");
});
