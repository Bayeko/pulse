import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CRON_AUTH_TOKEN = Deno.env.get("CRON_AUTH_TOKEN");
if (!CRON_AUTH_TOKEN) {
  throw new Error("Missing CRON_AUTH_TOKEN environment variable");
}
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
if (!SUPABASE_URL) {
  throw new Error("Missing SUPABASE_URL environment variable");
}
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${CRON_AUTH_TOKEN}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);

  const { error } = await supabase
    .from("messages")
    .delete()
    .lt("created_at", cutoff.toISOString());

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
