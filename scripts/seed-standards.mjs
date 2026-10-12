/**
 * Seeds trust seals and certifications shown on the Our Legacy standards section.
 *
 * Usage:
 *   $env:STRAPI_API_TOKEN="<token>"; node scripts/seed-standards.mjs
 *
 * The standard image is intentionally not seeded here. It is a Strapi media
 * relation and should be uploaded/attached from the admin media library.
 */

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

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${API_TOKEN}`,
};

const standards = [
  {
    title: "EdTech Trust Seal",
    issuer: "Digital Bridge Institute",
    description: "SAN TECH received the EdTech Trust Seal from the Digital Bridge Institute for its contribution to practical technology learning and innovation.",
    imageAlt: "Digital Bridge Institute EdTech Trust Seal",
    sortOrder: 1,
  },
];

async function request(path, options = {}) {
  const response = await fetch(`${STRAPI_URL}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers ?? {}) },
  });

  if (!response.ok) {
    throw new Error(`${options.method ?? "GET"} ${path} -> ${response.status}: ${await response.text()}`);
  }

  return response.status === 204 ? null : response.json();
}

for (const standard of standards) {
  const query = new URLSearchParams({
    "filters[title][$eq]": standard.title,
    "pagination[pageSize]": "1",
  });
  const existing = await request(`/api/standards?${query.toString()}`);
  const payload = {
    data: { ...standard, publishedAt: new Date().toISOString() },
  };

  if (existing.data?.[0]) {
    await request(`/api/standards/${existing.data[0].documentId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    console.log(`Updated standard: ${standard.title}`);
  } else {
    await request("/api/standards", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    console.log(`Created standard: ${standard.title}`);
  }
}

console.log("Standards seed complete. Attach standard images in the Strapi admin.");
