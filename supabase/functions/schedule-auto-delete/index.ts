import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
 codex/add-jwt-validation-with-401-response
  const token = Deno.env.get("CRON_AUTH_TOKEN");
  const authHeader = req.headers.get("authorization");
  if (!token || authHeader !== `Bearer ${token}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,

  const projectRef = Deno.env.get("PROJECT_REF");
  if (!projectRef) {
    console.error("Missing PROJECT_REF environment variable");
    return new Response(JSON.stringify({ error: "Missing project reference" }), {
      status: 500,
 main
      headers: { "Content-Type": "application/json" },
    });
  }

  const { enabled } = await req.json();
  const accessToken = Deno.env.get("SUPABASE_ACCESS_TOKEN");
  if (!accessToken) {
    return new Response(JSON.stringify({ error: "Missing access token" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const baseUrl = `https://api.supabase.com/v1/projects/${projectRef}/cron/jobs`;
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  if (enabled) {
    const res = await fetch(baseUrl, {
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
    const res = await fetch(baseUrl, { headers });
    const { jobs } = await res.json();
    const job = (jobs as Array<{ id: string; name: string }> | undefined)?.find(
      (j) => j.name === "auto-delete-messages",
    );
    if (job) {
      const deleteRes = await fetch(`${baseUrl}/${job.id}`, {
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
