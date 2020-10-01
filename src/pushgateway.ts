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

    constructor(job: string, hostname = PUSHGATEWAY_HOST, pushInterval = 30000, protocol = "http") {
        this.job = job;
        this.hostname = hostname;
        this.pushInterval = pushInterval;
        this.protocol = protocol;
    }

    sendOnInterval(stringer: Stringy): void {
        this.interval = setInterval(() => {
            try {
                this.send(stringer.toString());
            } catch (e) {
                console.error(`pushgateway ${this.job} ${this.protocol}://${this.hostname} failed.`);
            }
        }, this.pushInterval);
    }

    clearInterval(): void {
        clearInterval(this.pushInterval);
    }

    send(
        fileContent: string
    ): Promise<string> {

        const url = `${this.protocol}://${this.hostname}/metrics/job/${this.job}`;
        const out = new TextEncoder().encode(fileContent);
        const result = new Promise<string>((resolve, reject) => {
            const response = fetch(
                url,
                {
                    method: "POST",
                    body: out,
                },
            ).then(async (response) => {
                if (!(response.status == 202 || response.status == 200)) {
                    reject(new Error("expected 200.  status: ${response.status}"));
                    return;
                }

                resolve(await response.text());
            }).catch(reject);


        });

        return result;
    }

}
