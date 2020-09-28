import { assertThrows, assertEquals } from "https://deno.land/std@0.71.0/testing/asserts.ts";
import { Counter, HistoryCounter } from "./counter.ts";

const metricTimeoutError = "process_timeout_errors_total";
const metricNumberOfRequests = "http_requests_total";
const metricReqDuration = "process_execution_duration_seconds";


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

Deno.test("bad values", async (): Promise<void> => {

    const timeoutErrorMetricCounter: Counter = new Counter("hi");

    timeoutErrorMetricCounter.inc();

    assertThrows(() => {
        timeoutErrorMetricCounter.inc(0);
    });

    assertThrows(() => {
        timeoutErrorMetricCounter.inc(-2);
    });


});
