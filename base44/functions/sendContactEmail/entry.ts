// This function is intentionally disabled. The logic was moved to the Contact page component.
Deno.serve((req) => {
  return new Response(JSON.stringify({ success: true, message: "הפונקציה אינה פעילה" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});