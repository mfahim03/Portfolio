import { requireAdmin } from "@/lib/admin-auth";
import { getPortraitUrl, savePortraitUrl } from "@/models/portfolio-model";

export const runtime = "nodejs";

export async function GET() {
  try { return Response.json({ portrait_url: await getPortraitUrl() }); }
  catch (error) { return Response.json({ error: error.message }, { status: 503 }); }
}

export async function PUT(request) {
  if (!(await requireAdmin(request))) return Response.json({ error: "Sign in as the portfolio admin to update the portrait." }, { status: 401 });
  try {
    const { portrait_url } = await request.json();
    if (portrait_url && !/^https:\/\//i.test(portrait_url)) throw new Error("Portrait must be an HTTPS URL.");
    await savePortraitUrl(portrait_url || "");
    return Response.json({ portrait_url: portrait_url || "" });
  } catch (error) { return Response.json({ error: error.message }, { status: 400 }); }
}
