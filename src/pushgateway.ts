import * as log from "https://deno.land/std@0.71.0/log/mod.ts";

const jobName = "my-pg-job";
const pushgatewayHost = "my.pushgateway.com:9091";

// function to push metrics to prometheus "pushgateway"
export async function pushMetrics(
    fileContent: string
): Promise<void> {
    const pgURL = getPushgatewayHostName(jobName);
    try {
        const cleanedUpFileContent = unescape(encodeURIComponent(fileContent));
        const out = new TextEncoder().encode(cleanedUpFileContent);
        const response = await fetch(
            pgURL,
            {
                method: "POST",
                body: out,
            },
        );
        await response.text();
        if (!(response.status == 202 || response.status == 200)) {
            log.error(`failed to POST to pushgateway URL ${pgURL}, status ${response.status}`);
        }
    } catch (e) {
        log.error(`unexpected error: failed to POST to pushgateway URL ${pgURL}, ${e}`);
    }
}

function getPushgatewayHostName(pushgatewayJobName: string): string {
    const pushgatewayURI = `metrics/job/${pushgatewayJobName}`;
    return `http://${pushgatewayHost}/${pushgatewayURI}`;
}
