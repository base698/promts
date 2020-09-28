import { Stringy } from "./types.ts";
import { PUSHGATEWAY_HOST } from "./config.ts";

/** PushGateway is an http connection to send data into a configured pushgateway.
 * data can be sent on an interval or at the time of calling send.
 */
export class PushGateway {
    job: string;
    hostname: string;
    pushInterval: number;
    protocol: string;
    interval = -1;

    constructor(job: string, hostname = PUSHGATEWAY_HOST, pushInterval = 30000, protocol = "http") {
        this.job = job;
        this.hostname = hostname;
        this.pushInterval = pushInterval;
        this.protocol = protocol;
    }

    sendOnInterval(stringer: Stringy): void {
        this.interval = setInterval(() => {
            this.send(stringer.toString());
        }, this.pushInterval);
    }

    clearInterval(): void {
        clearInterval(this.pushInterval);
    }

    async send(
        fileContent: string
    ): Promise<string> {

        const url = `${this.protocol}://${this.hostname}/metrics/job/${this.job}`;
        const out = new TextEncoder().encode(fileContent);

        const response = await fetch(
            url,
            {
                method: "POST",
                body: out,
            },
        );
        const responseBody = await response.text();
        if (!(response.status == 202 || response.status == 200)) {
            throw new Error("status: ${response.status}\n${responseBody}");
        }
        return responseBody;
    }

}
