export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    return Response.json({ id, status: "received", createdAt, body });
  } catch (err) {
    return new Response("Invalid request", { status: 400 });
  }
}

export async function GET() {
  return Response.json({
    message: "Support tickets API",
    usage: "POST with {name, email, subject, message} to create a ticket",
  });
}