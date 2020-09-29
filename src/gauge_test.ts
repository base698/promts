/**
 * Copyright Verizon Media, Licensed under the terms of the MIT license.
 * See LICENSE file in project root for terms.
 */

import { assertThrows, assertEquals } from "https://deno.land/std@0.71.0/testing/asserts.ts";
import { Gauge } from "./gauge.ts";

Deno.test("gauge increment", async (): Promise<void> => {
    const gauge: Gauge = new Gauge("gauge_procs");

    gauge.inc();
    gauge.inc(5);
    assertEquals(gauge.getTotal(), 6);


});

Deno.test("gauge decrement", async (): Promise<void> => {

    const gauge: Gauge = new Gauge("dec_counter");

    gauge.inc();
    gauge.inc(5);
    gauge.dec(2);
    assertEquals(gauge.getTotal(), 4);


    gauge.inc(-1);
    assertEquals(gauge.getTotal(), 3);



});

Deno.test("gauge toString()", async (): Promise<void> => {
    const gauge: Gauge = new Gauge("dec_counter", { region: "US" });

    gauge.inc(500);

    assertEquals(gauge.toString(), `dec_counter{region="US"} 500\n`);
    new Gauge("dec:counter", { region: "US" }).inc();
});


Deno.test("gauge toString()", async (): Promise<void> => {
    assertThrows(() => {
        new Gauge("hito%%", { region: "US" });
    });

    assertThrows(() => {
        new Gauge("hi2u", { "re|gion": "US" });
    });

});
