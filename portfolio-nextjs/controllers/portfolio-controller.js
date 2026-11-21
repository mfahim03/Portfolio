import { createResourceRecord, deleteResourceRecord, getResourceRecord, listResource, updateResourceRecord } from "@/models/portfolio-model";
import { requireAdmin } from "@/lib/admin-auth";

function failure(error, fallback = "Request failed.", status = 400) {
  return Response.json({ error: error?.message || fallback }, { status });
}

export async function listController(resource) {
  try {
    const records = await listResource(resource);
    return records ? Response.json(records) : failure(null, "Resource not found.", 404);
  } catch (error) { return failure(error, "Firestore is unavailable.", 503); }
}

export async function createController(request, resource) {
  if (!(await requireAdmin(request))) return failure(null, "Sign in as the portfolio admin to make changes.", 401);
  try {
    const record = await createResourceRecord(resource, await request.json());
    return record ? Response.json(record, { status: 201 }) : failure(null, "Resource not found.", 404);
  } catch (error) { return failure(error, "Could not save this record."); }
}

export async function readController(resource, id) {
  try {
    const record = await getResourceRecord(resource, id);
    return record ? Response.json(record) : failure(null, "Record not found.", 404);
  } catch (error) { return failure(error, "Firestore is unavailable.", 503); }
}

export async function updateController(request, resource, id) {
  if (!(await requireAdmin(request))) return failure(null, "Sign in as the portfolio admin to make changes.", 401);
  try {
    const record = await updateResourceRecord(resource, id, await request.json());
    return record ? Response.json(record) : failure(null, "Record not found.", 404);
  } catch (error) { return failure(error, "Could not update this record."); }
}

export async function deleteController(request, resource, id) {
  if (!(await requireAdmin(request))) return failure(null, "Sign in as the portfolio admin to make changes.", 401);
  try {
    const deleted = await deleteResourceRecord(resource, id);
    return deleted ? Response.json({ deleted: true }) : failure(null, "Record not found.", 404);
  } catch (error) { return failure(error, "Could not delete this record."); }
}
