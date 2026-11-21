import { requireAdmin } from "@/lib/admin-auth";
import { uploadImage } from "@/models/portfolio-model";

export const runtime = "nodejs";

export async function POST(request) {
  if (!(await requireAdmin(request))) return Response.json({ error: "Sign in as the portfolio admin to upload images." }, { status: 401 });
  try {
    const form = await request.formData();
    const file = form.get("file");
    const folder = form.get("folder") === "profile" ? "profile" : "projects";
    if (!file || typeof file.arrayBuffer !== "function") return Response.json({ error: "Choose an image to upload." }, { status: 400 });
    return Response.json({ url: await uploadImage(file, folder) }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message || "Image upload failed." }, { status: 400 });
  }
}
