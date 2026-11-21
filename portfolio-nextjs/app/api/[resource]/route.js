import { createController, listController } from "@/controllers/portfolio-controller";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  return listController((await params).resource);
}

export async function POST(request, { params }) {
  return createController(request, (await params).resource);
}
