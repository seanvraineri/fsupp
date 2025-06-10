import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type"
};

serve(async (req) => {
  console.log("test_cors function invoked, method:", req.method);
  
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request");
    return new Response("", { status: 204, headers: cors });
  }
  
  if (req.method === "POST") {
    console.log("Handling POST request");
    return new Response(JSON.stringify({ message: "Hello from test_cors" }), {
      status: 200,
      headers: { ...cors, "Content-Type": "application/json" }
    });
  }
  
  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { ...cors, "Content-Type": "application/json" }
  });
}); 