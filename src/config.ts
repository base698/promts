/**
 * Copyright EdgeCast, Licensed under the terms of the MIT license.
 * See LICENSE file in project root for terms.
 */

const pgPort = Deno.env.get("PUSHGATEWAY_PORT") || "9091";
const pgHost = Deno.env.get("PUSHGATEWAY_HOST") || "localhost";
export const PUSHGATEWAY_HOST = `${pgHost}:${pgPort}`;
