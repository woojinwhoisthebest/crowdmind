export async function onRequestPost({ request, env }) {
  if (!env.DB) return Response.json({error:"Database is not configured."},{status:503});
  let b; try { b=await request.json(); } catch { return Response.json({error:"Invalid JSON."},{status:400}); }
  const pollId=String(b.pollId||""), voterId=String(b.voterId||""), optionIndex=Number(b.optionIndex);
  if(!pollId||!voterId||voterId.length>100||!Number.isInteger(optionIndex)) return Response.json({error:"Invalid vote."},{status:400});
  const poll=await env.DB.prepare("SELECT options_json,status FROM polls WHERE id=?").bind(pollId).first();
  if(!poll||poll.status!=="active") return Response.json({error:"Poll not found or unavailable."},{status:404});
  const options=JSON.parse(poll.options_json);
  if(optionIndex<0||optionIndex>=options.length) return Response.json({error:"Invalid choice."},{status:400});
  try {
    await env.DB.prepare("INSERT INTO votes (poll_id,voter_id,option_index,created_at) VALUES (?,?,?,?)").bind(pollId,voterId,optionIndex,Date.now()).run();
  } catch(e) {
    return Response.json({error:"This browser has already voted in that poll."},{status:409});
  }
  await env.DB.prepare("UPDATE polls SET total_votes=total_votes+1 WHERE id=?").bind(pollId).run();
  return Response.json({ok:true});
}
