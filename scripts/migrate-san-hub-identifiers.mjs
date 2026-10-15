if (process.loadEnvFile) {
  try {
    process.loadEnvFile();
  } catch {}
}

const STRAPI_URL = (process.env.STRAPI_URL ?? "http://localhost:1337").replace(/\/$/, "");
const API_TOKEN = process.env.STRAPI_API_TOKEN ?? "";

if (!API_TOKEN) {
  console.error("STRAPI_API_TOKEN is not set.");
  process.exit(1);
}

const headers = { "Content-Type": "application/json", Authorization: `Bearer ${API_TOKEN}` };

async function request(path, options = {}) {
  const response = await fetch(`${STRAPI_URL}${path}`, { ...options, headers: { ...headers, ...(options.headers ?? {}) } });
  if (!response.ok) throw new Error(`${options.method ?? "GET"} ${path} -> ${response.status}: ${await response.text()}`);
  return response.status === 204 ? null : response.json();
}

function toSlug(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

const result = await request("/api/san-hub-catalog-items?pagination[pageSize]=100");
const items = result.data ?? [];
const usedSlugs = new Set();
let updated = 0;

for (const item of items) {
  const baseSlug = item.slug || toSlug(item.title) || `catalog-item-${item.documentId.slice(0, 8)}`;
  let slug = baseSlug;
  if (usedSlugs.has(slug)) slug = `${baseSlug}-${item.documentId.slice(0, 8)}`;
  usedSlugs.add(slug);

  const data = {};
  if (item.slug !== slug) data.slug = slug;
  if (!Object.keys(data).length) continue;

  await request(`/api/san-hub-catalog-items/${item.documentId}`, {
    method: "PUT",
    body: JSON.stringify({ data }),
  });
  console.log(`Updated ${item.title}: ${data.slug ?? slug}`);
  updated++;
}

console.log(`SAN HUB identifier migration complete: ${updated} updated, ${items.length - updated} unchanged.`);
