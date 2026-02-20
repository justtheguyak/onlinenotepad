export async function onRequestGet(context) {
  const { searchParams } = new URL(context.request.url);
  const id = searchParams.get('id');
  
  if (!id) return new Response("ID Missing", { status: 400 });

  const data = await context.env.NOTES_KV.get(id);
  if (!data) return new Response("Note not found", { status: 404 });

  const note = JSON.parse(data);
  
  // We send back whether a password is required, but NOT the password itself!
  return new Response(JSON.stringify({
    content: note.password ? null : note.content,
    hasPassword: !!note.password
  }), { headers: { 'Content-Type': 'application/json' } });
}

// Add a POST method here to verify the password
export async function onRequestPost(context) {
  const { id, password } = await context.request.json();
  const data = await context.env.NOTES_KV.get(id);
  const note = JSON.parse(data);

  if (note.password === password) {
    return new Response(JSON.stringify({ content: note.content }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } else {
    return new Response(JSON.stringify({ error: "Wrong password" }), { status: 401 });
  }
}