/* global Deno */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getEnvVar } from "../_shared/env.ts";

const CRON_AUTH_TOKEN = getEnvVar("CRON_AUTH_TOKEN");
const SUPABASE_URL = getEnvVar("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = getEnvVar("SUPABASE_SERVICE_ROLE_KEY");

serve(async (req) => {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${CRON_AUTH_TOKEN}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
  );

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
