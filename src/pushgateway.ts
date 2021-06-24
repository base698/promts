/**
 * Copyright Verizon Media, Licensed under the terms of the MIT license.
 * See LICENSE file in project root for terms.
 */

import type { Stringy } from "./types.ts";
import { PUSHGATEWAY_HOST } from "./config.ts";

const backoff = [2, 4, 8, 16, 32];

/** PushGateway is an http connection to send data into a configured pushgateway.
 * data can be sent on an interval or at the time of calling send.
 */
export class PushGateway {
    job: string;
    hostname: string;
    pushInterval: number;
    protocol: string;
    interval: number;
    url: string;
    failures: number;
    lastAttempt: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    http: any;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(job: string, hostname = PUSHGATEWAY_HOST, pushInterval = 30000, protocol = "http", instance? : string, http:any = fetch) {
        this.job = job;
        this.hostname = hostname;
        this.pushInterval = pushInterval;
        this.protocol = protocol;
        this.failures = 0;
        this.http = http;
        this.lastAttempt = 0;
        this.interval = -1;
        this.url = `${this.protocol}://${this.hostname}/metrics/job/${this.job}`
        if (instance != undefined && instance != "") {
            this.url = `${this.url}/instance/${instance}`
        }
    }

    setLastAttempt(): void {
        this.lastAttempt = Date.now() / 1000;
    }

    doRequest(): boolean {
        if(this.failures == 0) {
            return true;
        }

        let backoffIdx = this.failures - 1;
        if(backoffIdx >= backoff.length) {
            backoffIdx = backoff.length - 1;
        }

        const seconds = backoff[backoffIdx];
        const timeToSend = (Date.now() / 1000) - seconds;
        return this.lastAttempt < timeToSend;
    }

    sendOnInterval(stringer: Stringy): void {
        this.interval = setInterval(async () => {
            try {
                if(this.doRequest()) {
                    this.setLastAttempt();
                    await this.send(stringer.toString());
                    this.failures = 0;
                }
            } catch (e) {
                this.failures += 1;
                console.log(e);
            }
        }, this.pushInterval);
    }

    clearInterval(): void {
        console.log(clearInterval(this.interval))
    }

    async send(
        fileContent: string
    ): Promise<string> {

        const out = new TextEncoder().encode(fileContent);
        const response = await this.http(
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
    }

}
