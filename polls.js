export async function onRequestGet({ env }) {
  if (!env.DB) return Response.json({ error: "Database is not configured." }, { status: 503 });
  const { results } = await env.DB.prepare(
    "SELECT id, question, options_json, category, creator, created_at, total_votes FROM polls WHERE status = 'active' ORDER BY created_at DESC LIMIT 100"
  ).all();
  const polls = [];
  for (const p of results || []) {
    const opts = JSON.parse(p.options_json);
    const { results: counts } = await env.DB.prepare(
      "SELECT option_index, COUNT(*) AS n FROM votes WHERE poll_id = ? GROUP BY option_index"
    ).bind(p.id).all();
    const votes = opts.map(() => 0);
    for (const c of counts || []) if (c.option_index >= 0 && c.option_index < votes.length) votes[c.option_index] = c.n;
    const total = votes.reduce((a,b)=>a+b,0);
    polls.push({ id:p.id, question:p.question, options:opts, category:p.category, creator:p.creator, createdAt:p.created_at, totalVotes:total, votes: total ? votes.map(n=>Math.round(n*100/total)) : votes.map(()=>0) });
  }
  return Response.json({ polls }, { headers: { "Cache-Control": "no-store" } });
}
export async function onRequestPost({ request, env }) {
  if (!env.DB) return Response.json({ error: "Database is not configured." }, { status: 503 });
  let body; try { body = await request.json(); } catch { return Response.json({error:"Invalid JSON."},{status:400}); }
  const question = String(body.question || "").trim();
  const options = Array.isArray(body.options) ? body.options.map(x=>String(x).trim()) : [];
  const category = String(body.category || "Fun").slice(0,40);
  const creator = String(body.creator || "Anonymous").trim().slice(0,20) || "Anonymous";
  const voterId = String(body.voterId || "");
  if (question.length < 8 || question.length > 140) return Response.json({error:"Question must be 8–140 characters."},{status:400});
  if (options.length < 2 || options.length > 4 || options.some(x=>x.length<1||x.length>60) || new Set(options.map(x=>x.toLowerCase())).size!==options.length) return Response.json({error:"Add 2–4 different choices (up to 60 characters each)."}, {status:400});
  if (!voterId || voterId.length > 100) return Response.json({error:"Could not identify this browser. Please refresh."},{status:400});
  // Lightweight MVP safety filter only; a real launch should add human moderation and rate limiting.
  const blocked = /\b(kill yourself|doxx|swat|nudes|porn)\b/i;
  if (blocked.test(question) || options.some(x=>blocked.test(x))) return Response.json({error:"That poll may not be appropriate for this community."},{status:400});
  const { results: recent } = await env.DB.prepare("SELECT COUNT(*) AS n FROM polls WHERE creator = ? AND created_at > ?").bind(creator, Date.now()-60*60*1000).all();
  if ((recent?.[0]?.n || 0) >= 5) return Response.json({error:"Please wait before creating more polls."},{status:429});
  const id = crypto.randomUUID();
  const now = Date.now();
  await env.DB.prepare("INSERT INTO polls (id, question, options_json, category, creator, created_at) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(id, question, JSON.stringify(options), category, creator, now).run();
  return Response.json({ poll: { id, question, options, category, creator, createdAt: now, totalVotes:0, votes:options.map(()=>0) } }, {status:201});
}
