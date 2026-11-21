import { hasAdminSession, signInAdmin, signOutAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try { return Response.json({ authenticated: await hasAdminSession() }); }
  catch { return Response.json({ authenticated: false }); }
}

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    await signInAdmin(email, password);
    return Response.json({ authenticated: true });
  } catch (error) {
    return Response.json({ error: error.message || "Sign in failed." }, { status: 401 });
  }
}

export async function DELETE() {
  await signOutAdmin();
  return Response.json({ authenticated: false });
}
