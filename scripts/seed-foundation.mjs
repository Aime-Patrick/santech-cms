const STRAPI_URL = (process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337").replace(/\/$/, "");
const API_TOKEN = process.env.STRAPI_API_TOKEN || process.env.API_TOKEN || "";

const headers = {
  "Content-Type": "application/json",
  ...(API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : {}),
};

const payload = {
  data: {
    siteName: "SAN TECH",
    siteTitle: "SAN TECH | Technology. Innovation. Impact.",
    siteDescription: "SAN TECH builds technology, skills, and innovation systems for a more connected Africa.",
    defaultLanguage: "en",
    supportedLanguages: ["en", "rw"],
    calendlyUrl: process.env.CALENDLY_URL || "",
    socialLinks: [],
    seo: {
      title: "SAN TECH | Technology. Innovation. Impact.",
      description: "SAN TECH builds technology, skills, and innovation systems for a more connected Africa.",
      noIndex: false,
    },
  },
};

const response = await fetch(`${STRAPI_URL}/api/site-setting`, {
  method: "PUT",
  headers,
  body: JSON.stringify(payload),
});

if (!response.ok) {
  const body = await response.text();
  throw new Error(`Unable to seed site settings (${response.status}): ${body}`);
}

console.log(`Seeded site settings at ${STRAPI_URL}/api/site-setting`);
