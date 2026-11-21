import { deleteController, readController, updateController } from "@/controllers/portfolio-controller";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const { resource, id } = await params;
  return readController(resource, id);
}

export async function PUT(request, { params }) {
  const { resource, id } = await params;
  return updateController(request, resource, id);
}

export async function DELETE(request, { params }) {
  const { resource, id } = await params;
  return deleteController(request, resource, id);
}
