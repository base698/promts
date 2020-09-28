
const pgPort = Deno.env.get("PUSHGATEWAY_PORT") || "9091";
const pgHost = Deno.env.get("PUSHGATEWAY_HOST") || "localhost";
export const PUSHGATEWAY_HOST = `${pgHost}:${pgPort}`;
