import { toStringLabels } from "./utils.ts";
import { assertEquals } from "https://deno.land/std@0.71.0/testing/asserts.ts";

Deno.test("toStringLabels", async (): Promise<void> => {
    let result = toStringLabels({ x: "1", "y": "2" });
    assertEquals(result, 'x="1",y="2"');
    result = toStringLabels({ instance: "cache10.ama", "handler": "/url" });
    assertEquals(result, 'instance="cache10.ama",handler="/url"');
});
