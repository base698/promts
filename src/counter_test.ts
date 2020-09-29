/**
 * Copyright Verizon Media, Licensed under the terms of the MIT license.
 * See LICENSE file in project root for terms.
 */

import { assertThrows, assertEquals } from "https://deno.land/std@0.71.0/testing/asserts.ts";
import { Counter, HistoryCounter } from "./counter.ts";

const metricTimeoutError = "process_timeout_errors_total";

function createTimeoutErrorsMetricCounter(): HistoryCounter {
    const labels: Record<string, string> = {};
    const metricCounter = new HistoryCounter(metricTimeoutError, labels, 5);
    return metricCounter;
}

async function sleep(timeoutValue: number, id: number): Promise<string> {
    const startTime: number = Date.now();
    const promise = new Promise<string>((resolve) => {
        setTimeout(() => {
            const timeDiff = Date.now() - startTime;
            resolve("resolved");
            console.log(
                `${timeDiff} ms has passed since invocation, sleep function ID ${id}`,
            );
        }, timeoutValue);
    });
    return promise;
}

Deno.test("HistoryMetricCounter", async (): Promise<void> => {
    const timeoutErrorMetricCounter: HistoryCounter = createTimeoutErrorsMetricCounter();
    timeoutErrorMetricCounter.inc();
    await sleep(1000, 1);
    timeoutErrorMetricCounter.inc();
    await sleep(500, 2);
    timeoutErrorMetricCounter.inc();
    await sleep(500, 3);
    const totalErrCount: number = timeoutErrorMetricCounter.getTotal();
    assertEquals(totalErrCount, 3);

    timeoutErrorMetricCounter.inc(6);

    const totalErrCountLast: number = timeoutErrorMetricCounter.getTotal();
    assertEquals(totalErrCountLast, 9);

});

Deno.test("invalid values", async (): Promise<void> => {

    const timeoutErrorMetricCounter: Counter = new Counter("hi");

    timeoutErrorMetricCounter.inc();

    assertThrows(() => {
        timeoutErrorMetricCounter.inc(0);
    });

    assertThrows(() => {
        timeoutErrorMetricCounter.inc(-2);
    });


});

Deno.test("Counter.toString()", async (): Promise<void> => {

    const hi: Counter = new Counter("hi", { service: "web" }, "is times I said hello");

    const expected = `hi{service="web"} 1\n`;
    const expectedHelp = `# HELP hi is times I said hello
# TYPE hi counter
hi{service="web"} 1
`;

    hi.inc();
    assertEquals(hi.toString(), expected);
    assertEquals(hi.toString(false), expectedHelp);

});
