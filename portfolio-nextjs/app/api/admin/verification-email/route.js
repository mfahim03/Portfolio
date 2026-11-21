import { sendAdminVerification } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const result = await sendAdminVerification(email, password);
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message || "Could not request an email verification link." }, { status: 400 });
  }
}
