import { assertArrayContains, assertThrowsAsync } from "https://deno.land/std@0.71.0/testing/asserts.ts";
import { PushGateway } from "./pushgateway.ts";
import { Counter } from "./counter.ts";
import { PUSHGATEWAY_HOST } from "./config.ts";
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
    assertArrayContains(splitArr, expected);

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
    assertArrayContains(splitArr, expected);

});
