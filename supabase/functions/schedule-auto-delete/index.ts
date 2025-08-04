/* global Deno */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getEnvVar } from "../_shared/env.ts";

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  retries = 3,
  backoff = 500,
): Promise<Response> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url, init);
      if (res.ok || res.status < 500 || attempt === retries - 1) {
        return res;
      }
    } catch (err) {
      if (attempt === retries - 1) throw err;
    }

    await new Promise((r) => setTimeout(r, backoff * (attempt + 1)));
  }

  throw new Error("Failed to fetch after retries");
}

const CRON_AUTH_TOKEN = getEnvVar('CRON_AUTH_TOKEN');
const PROJECT_REF = getEnvVar('PROJECT_REF');
const SUPABASE_ACCESS_TOKEN = getEnvVar('SUPABASE_ACCESS_TOKEN');

serve(async req => {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${CRON_AUTH_TOKEN}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { enabled } = await req.json();
  const baseUrl = `https://api.supabase.com/v1/projects/${PROJECT_REF}/cron/jobs`;
  const headers = {
    Authorization: `Bearer ${SUPABASE_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  };

  if (enabled) {
    const res = await fetchWithRetry(baseUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: "auto-delete-messages",
        schedule: "0 0 * * *",
        function: "auto-delete-messages",
      }),
    });
    if (!res.ok) {
      const errorBody = await res.text();
      console.error(
        `Failed to create cron job: ${res.status} ${errorBody}`,
      );
      return new Response(
        JSON.stringify({ error: "Failed to create cron job" }),
        {
          status: res.status,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  } else {
    let res: Response;
    try {
      res = await fetchWithRetry(baseUrl, { headers });
    } catch (err) {
      console.error(`Failed to fetch cron jobs: ${err}`);
      return new Response(
        JSON.stringify({ error: "Failed to fetch cron jobs" }),
        {
          status: 502,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    if (!res.ok) {
      const errorBody = await res.text();
      console.error(
        `Failed to fetch cron jobs: ${res.status} ${errorBody}`,
      );
      return new Response(
        JSON.stringify({ error: "Failed to fetch cron jobs" }),
        {
          status: 502,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const { jobs } = await res.json();
    const job = (jobs as Array<{ id: string; name: string }> | undefined)?.find(
      (j) => j.name === "auto-delete-messages",
    );
    if (job) {
      const deleteRes = await fetchWithRetry(`${baseUrl}/${job.id}`, {
        method: "DELETE",
        headers,
      });
      if (!deleteRes.ok) {
        const errorBody = await deleteRes.text();
        console.error(
          `Failed to delete cron job ${job.id}: ${deleteRes.status} ${errorBody}`,
        );
        return new Response(
          JSON.stringify({ error: "Failed to delete cron job" }),
          {
            status: deleteRes.status,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
    }
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
