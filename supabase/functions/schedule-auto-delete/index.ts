import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const projectRef =
  Deno.env.get("PROJECT_REF") ||
  Deno.env.get("PROJECT_ID") ||
  "qwfqrehcliowhkssmkhx";

serve(async (req) => {
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
    await fetch(baseUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: "auto-delete-messages",
        schedule: "0 0 * * *",
        function: "auto-delete-messages",
      }),
    });
  } else {
    const res = await fetch(baseUrl, { headers });
    const { jobs } = await res.json();
    const job = (jobs as Array<{ id: string; name: string }> | undefined)?.find(
      (j) => j.name === "auto-delete-messages",
    );
    if (job) {
      await fetch(`${baseUrl}/${job.id}`, { method: "DELETE", headers });
    }
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
});

