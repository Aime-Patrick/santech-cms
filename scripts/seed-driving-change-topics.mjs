const STRAPI_URL = (process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337").replace(/\/$/, "");
const API_TOKEN = process.env.STRAPI_API_TOKEN || "";

if (!API_TOKEN) {
  console.error("STRAPI_API_TOKEN is required.");
  process.exit(1);
}

const topics = [
  { topicId: "systems-in-use", sectionKey: "impact", label: "Systems in use", subtitle: "Deployed systems and live institutional operations", sortOrder: 1 },
  { topicId: "learning-that-remains", sectionKey: "impact", label: "Learning that remains", subtitle: "Technical training and self-sustaining institutional capability", sortOrder: 2 },
  { topicId: "world-context", sectionKey: "impact", label: "World context", subtitle: "Technology designed for local realities and infrastructure", sortOrder: 3 },
  { topicId: "practical-entry", sectionKey: "career", label: "Practical entry", subtitle: "Hands-on university labs, high school STEM camps & bootcamps", sortOrder: 1 },
  { topicId: "mentorship-and-placement", sectionKey: "career", label: "Mentorship and placement", subtitle: "Apprenticeships, senior engineering mentorship & career launchpads", sortOrder: 2 },
  { topicId: "community-outreach", sectionKey: "career", label: "Community outreach", subtitle: "Open community hackathons, tech summits & digital inclusion", sortOrder: 3 },
];

const headers = { Authorization: `Bearer ${API_TOKEN}`, "Content-Type": "application/json" };
async function request(path, init) {
  const response = await fetch(`${STRAPI_URL}${path}`, { ...init, headers: { ...headers, ...(init?.headers ?? {}) } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${await response.text()}`);
  return response.json();
}

for (const topic of topics) {
  const existing = await request(`/api/driving-change-topics?filters[topicId][$eq]=${encodeURIComponent(topic.topicId)}&pagination[pageSize]=1`);
  if (existing.data?.length) {
    console.log(`Skip ${topic.topicId}`);
    continue;
  }
  await request("/api/driving-change-topics", {
    method: "POST",
    body: JSON.stringify({ data: { ...topic, publishedAt: new Date().toISOString() } }),
  });
  console.log(`Created ${topic.topicId}`);
}

console.log("Driving Change topics seed complete.");
