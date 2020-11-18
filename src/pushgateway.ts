/**
 * Copyright Verizon Media, Licensed under the terms of the MIT license.
 * See LICENSE file in project root for terms.
 */

import type { Stringy } from "./types.ts";
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
    url: string;

    constructor(job: string, hostname = PUSHGATEWAY_HOST, pushInterval = 30000, protocol = "http", instance? : string) {
        this.job = job;
        this.hostname = hostname;
        this.pushInterval = pushInterval;
        this.protocol = protocol;
        this.url = `${this.protocol}://${this.hostname}/metrics/job/${this.job}`
        if (instance != undefined && instance != "") {
            this.url = `${this.url}/${instance}`
        }
    }

    sendOnInterval(stringer: Stringy): void {
        this.interval = setInterval(() => {
            try {
                this.send(stringer.toString());
            } catch (e) {
                console.error(`failed to send on interval to ${this.url}`);
            }
        }, this.pushInterval);
    }

    clearInterval(): void {
        clearInterval(this.pushInterval);
    }

    async send(
        fileContent: string
    ): Promise<string> {

        const out = new TextEncoder().encode(fileContent);
        try {
            const response = await fetch(
                this.url,
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
        } catch (e) {
            console.error(`failed to POST to ${this.url} using fetch: `, e);
            return "";
        }

    }

}
