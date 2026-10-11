export async function onRequestPost({ request, env }) {
  if (!env.DB) return Response.json({error:"Database is not configured."},{status:503});
  let b; try { b=await request.json(); } catch { return Response.json({error:"Invalid JSON."},{status:400}); }
  const pollId=String(b.pollId||""), reason=String(b.reason||"Other").slice(0,80);
  if(!pollId) return Response.json({error:"Missing poll id."},{status:400});
  const poll=await env.DB.prepare("SELECT id FROM polls WHERE id=?").bind(pollId).first();
  if(!poll) return Response.json({error:"Poll not found."},{status:404});
  await env.DB.prepare("INSERT INTO poll_reports (poll_id,reason,created_at) VALUES (?,?,?)").bind(pollId,reason,Date.now()).run();
  return Response.json({ok:true},{status:201});
}
