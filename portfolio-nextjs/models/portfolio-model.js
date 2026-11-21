import { createPrivateKey, createSign } from "node:crypto";

const projectId = process.env.FIREBASE_PROJECT_ID;
const documentsUrl = () => `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
const resources = {
  education: { collection: "education", fields: ["degree", "school", "detail", "period", "sort_order"], required: ["degree", "school", "period"] },
  "work-experience": { collection: "work_experience", fields: ["role", "organization", "period", "summary", "sort_order"], required: ["role", "organization", "period"] },
  certifications: { collection: "certifications", fields: ["name", "issuer", "date", "sort_order"], required: ["name", "issuer", "date"] },
  "tech-categories": { collection: "tech_categories", fields: ["name", "sort_order"], required: ["name"] },
  "tech-items": { collection: "tech_items", fields: ["name", "category_id", "icon_slug", "sort_order"], required: ["name", "category_id"] },
  projects: { collection: "projects", fields: ["title", "project_type", "summary", "frontend", "backend", "technologies", "website_url", "demo_url", "repo_url", "figma_url", "image_urls", "sort_order"], required: ["title", "project_type", "summary"] },
};
let cachedToken;
let tokenExpiresAt = 0;

function base64url(value) { return Buffer.from(value).toString("base64url"); }

async function getAccessToken() {
  if (!projectId || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    throw new Error("Firebase is not configured. Add the Firebase service-account values to .env.local.");
  }
  if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;
  let privateKey;
  try {
    privateKey = createPrivateKey(process.env.FIREBASE_PRIVATE_KEY.replaceAll("\\n", "\n"));
  } catch {
    throw new Error("FIREBASE_PRIVATE_KEY is not a valid service-account key. Replace the example value in portfolio-nextjs/.env.local with the private_key from your Firebase service-account JSON file.");
  }
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64url(JSON.stringify({ iss: process.env.FIREBASE_CLIENT_EMAIL, scope: "https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/devstorage.read_write", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 }));
  const unsigned = `${header}.${claim}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  const assertion = `${unsigned}.${signer.sign(privateKey, "base64url")}`;
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
    cache: "no-store",
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error_description || "Firebase service account could not be authenticated.");
  cachedToken = body.access_token;
  tokenExpiresAt = Date.now() + Math.max(60, body.expires_in - 120) * 1000;
  return cachedToken;
}

function encodeFields(data) {
  return Object.fromEntries(Object.entries(data).map(([key, value]) => [key,
    typeof value === "number" ? { integerValue: String(value) } : Array.isArray(value) ? { arrayValue: { values: value.map((item) => ({ stringValue: String(item) })) } } : { stringValue: String(value) }]));
}

function decodeFields(document) {
  if (!document) return null;
  const id = document.name.split("/").at(-1);
  const fields = Object.fromEntries(Object.entries(document.fields || {}).map(([key, value]) => [key,
    value.stringValue ?? value.integerValue ?? value.doubleValue ?? value.booleanValue ?? (value.arrayValue ? (value.arrayValue.values || []).map((entry) => entry.stringValue ?? "") : "")]));
  for (const [key, value] of Object.entries(fields)) if (["sort_order"].includes(key)) fields[key] = Number(value);
  return { id, ...fields };
}

async function firestoreFetch(url, options = {}) {
  const token = await getAccessToken();
  const response = await fetch(url, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, ...(options.body ? { "Content-Type": "application/json" } : {}), ...options.headers },
    cache: "no-store",
  });
  if (response.status === 404) return null;
  const body = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(body?.error?.message || "Firestore request failed.");
  return body;
}

export async function listResource(route) {
  const resource = resources[route];
  if (!resource) return null;
  const queryUrl = `${documentsUrl()}:runQuery`;
  const result = await firestoreFetch(queryUrl, { method: "POST", body: JSON.stringify({ structuredQuery: {
    from: [{ collectionId: resource.collection }],
    orderBy: [{ field: { fieldPath: "sort_order" }, direction: "ASCENDING" }],
  } }) });
  const documents = (result || []).map((entry) => decodeFields(entry.document)).filter(Boolean);
  if (route !== "tech-items") return documents;
  const categories = await listResource("tech-categories");
  const labels = new Map(categories.map((category) => [category.id, category.name]));
  return documents.map((item) => ({ ...item, category: labels.get(item.category_id) || "" }));
}

export async function getResourceRecord(route, id) {
  const resource = resources[route];
  if (!resource) return null;
  const document = await firestoreFetch(`${documentsUrl()}/${resource.collection}/${encodeURIComponent(id)}`);
  return decodeFields(document);
}

export async function createResourceRecord(route, data, explicitId) {
  const resource = resources[route];
  if (!resource) return null;
  const values = validate(resource, data);
  await validateReferences(route, values);
  const query = explicitId ? `?documentId=${encodeURIComponent(explicitId)}` : "";
  const document = await firestoreFetch(`${documentsUrl()}/${resource.collection}${query}`, {
    method: "POST", body: JSON.stringify({ fields: encodeFields(values) }),
  });
  return decodeFields(document);
}

export async function updateResourceRecord(route, id, data) {
  const resource = resources[route];
  if (!resource) return null;
  const existing = await getResourceRecord(route, id);
  if (!existing) return null;
  const values = validate(resource, data, true);
  await validateReferences(route, values);
  const mask = Object.keys(values).map((field) => `updateMask.fieldPaths=${encodeURIComponent(field)}`).join("&");
  const document = await firestoreFetch(`${documentsUrl()}/${resource.collection}/${encodeURIComponent(id)}?${mask}`, {
    method: "PATCH", body: JSON.stringify({ fields: encodeFields(values) }),
  });
  return decodeFields(document);
}

async function validateReferences(route, values) {
  if (route === "tech-items" && Object.hasOwn(values, "category_id")) {
    const category = await getResourceRecord("tech-categories", values.category_id);
    if (!category) throw new Error("Choose an existing tech category.");
  }
}

export async function deleteResourceRecord(route, id) {
  const resource = resources[route];
  if (!resource) return null;
  const existing = await getResourceRecord(route, id);
  if (!existing) return false;
  if (route === "tech-categories") {
    const items = await listResource("tech-items");
    if (items.some((item) => item.category_id === id)) throw new Error("Move or delete this category’s tech items before deleting the category.");
  }
  await firestoreFetch(`${documentsUrl()}/${resource.collection}/${encodeURIComponent(id)}`, { method: "DELETE" });
  return true;
}

function validate(resource, data, partial = false) {
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Send a JSON object.");
  const values = Object.fromEntries(resource.fields.filter((field) => Object.hasOwn(data, field)).map((field) => [field,
    field === "sort_order" ? Number(data[field]) || 0 : ["technologies", "image_urls"].includes(field) ? (Array.isArray(data[field]) ? data[field] : String(data[field] || "").split(",")).map((value) => String(value).trim()).filter(Boolean) : String(data[field]).trim()]));
  if (!partial && resource.required.some((field) => !values[field])) throw new Error(`Required fields: ${resource.required.join(", ")}.`);
  if (resource.required.some((field) => Object.hasOwn(values, field) && !values[field])) throw new Error("Required values cannot be blank.");
  if (!Object.keys(values).length) throw new Error("Provide at least one supported field.");
  if (Object.hasOwn(values, "category_id")) values.category_id = String(values.category_id);
  if (Object.hasOwn(values, "project_type") && !["mobile", "web", "desktop", "other"].includes(values.project_type)) throw new Error("Choose a valid project type.");
  for (const key of ["website_url", "demo_url", "repo_url", "figma_url"]) if (values[key] && !/^https:\/\//i.test(values[key])) throw new Error(`${key} must start with https://.`);
  return values;
}

export async function uploadImage(file, folder = "projects") {
  const bucket = process.env.FIREBASE_STORAGE_BUCKET;
  if (!bucket) throw new Error("Set FIREBASE_STORAGE_BUCKET in portfolio-nextjs/.env.local to enable image uploads.");
  const token = await getAccessToken();
  const { randomUUID, randomBytes } = await import("node:crypto");
  const extension = ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" })[file.type];
  if (!extension || file.size > 3_500_000) throw new Error("Choose a JPEG, PNG, WebP or AVIF image under 3.5 MB.");
  const name = `${folder}/${randomUUID()}.${extension}`;
  const downloadToken = randomBytes(24).toString("hex");
  const boundary = `portfolio_${randomUUID().replaceAll("-", "")}`;
  const metadata = JSON.stringify({ name, contentType: file.type, metadata: { firebaseStorageDownloadTokens: downloadToken } });
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Type: ${file.type}\r\n\r\n`),
    Buffer.from(await file.arrayBuffer()), Buffer.from(`\r\n--${boundary}--`),
  ]);
  const response = await fetch(`https://storage.googleapis.com/upload/storage/v1/b/${encodeURIComponent(bucket)}/o?uploadType=multipart`, {
    method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": `multipart/related; boundary=${boundary}` }, body, cache: "no-store",
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error?.message || "Firebase Storage upload failed.");
  return `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(bucket)}/o/${encodeURIComponent(name)}?alt=media&token=${downloadToken}`;
}

export async function getPortraitUrl() {
  const document = await firestoreFetch(`${documentsUrl()}/site_settings/portfolio`);
  return decodeFields(document)?.portrait_url || "";
}

export async function savePortraitUrl(portraitUrl) {
  const existing = await firestoreFetch(`${documentsUrl()}/site_settings/portfolio`);
  if (!existing) return firestoreFetch(`${documentsUrl()}/site_settings?documentId=portfolio`, { method: "POST", body: JSON.stringify({ fields: encodeFields({ portrait_url: portraitUrl }) }) });
  const url = `${documentsUrl()}/site_settings/portfolio?updateMask.fieldPaths=portrait_url`;
  return firestoreFetch(url, { method: "PATCH", body: JSON.stringify({ fields: encodeFields({ portrait_url: portraitUrl }) }) });
}

export const resourceFields = Object.fromEntries(Object.entries(resources).map(([key, value]) => [key, value.fields.filter((field) => field !== "sort_order")]));
