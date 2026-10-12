/**
 * Seeds the CMS-backed SAN HUB content introduced in Phase 3.
 *
 * Usage:
 *   $env:STRAPI_API_TOKEN="<token>"; node scripts/seed-san-hub.mjs
 *
 * The script is safe to rerun: records are matched by their stable UID/key
 * and updated instead of duplicated.
 */

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

async function findOne(endpoint, field, value) {
  const params = new URLSearchParams();
  params.set(`filters[${field}][$eq]`, value);
  params.set("pagination[pageSize]", "1");
  const result = await request(`/api/${endpoint}?${params.toString()}`);
  return result.data?.[0] ?? null;
}

async function upsert(endpoint, field, record) {
  const existing = await findOne(endpoint, field, record[field]);
  const payload = { data: { ...record, publishedAt: new Date().toISOString() } };
  if (existing) {
    await request(`/api/${endpoint}/${existing.id}`, { method: "PUT", body: JSON.stringify(payload) });
    console.log(`Updated ${endpoint}: ${record[field]}`);
  } else {
    await request(`/api/${endpoint}`, { method: "POST", body: JSON.stringify(payload) });
    console.log(`Created ${endpoint}: ${record[field]}`);
  }
}

const BOOK_CATEGORIES = [
  { name: "Learning systems", slug: "learning-systems", description: "Practical learning resources and guides." },
  { name: "Artificial intelligence", slug: "artificial-intelligence", description: "AI, data, and responsible automation resources." },
  { name: "Impact and innovation", slug: "impact-and-innovation", description: "Stories and methods from useful technology projects." },
  { name: "Community and access", slug: "community-and-access", description: "Resources about connected communities and digital opportunity." },
];

const BOOKS = [
  { bookId: "san-book", title: "SAN BOOK", description: "Digital learning, academic resources, and practical guides from the SAN ecosystem.", category: "learning-systems", readerUrl: "/innovation-lab/product/san-book", coverTitle: "SAN BOOK", coverSubtitle: "Useful technology\nstronger systems", accent: "#0a1f44", coverInk: "#e8fbff", pageLabel: "01", sortOrder: 1 },
  { bookId: "ai-playbook", title: "AI PLAYBOOK", description: "A practical introduction to building useful AI products and workflows.", category: "artificial-intelligence", readerUrl: "/innovation-lab/product/san-book", coverTitle: "AI\nPLAYBOOK", coverSubtitle: "Build with intelligence", accent: "#087ea4", coverInk: "#f2ffff", pageLabel: "02", sortOrder: 2 },
  { bookId: "field-notes", title: "FIELD NOTES", description: "Stories, methods, and lessons from projects making technology more useful.", category: "impact-and-innovation", readerUrl: "/innovation-lab/product/san-book", coverTitle: "FIELD\nNOTES", coverSubtitle: "Impact and innovation", accent: "#355c4c", coverInk: "#fff7d7", pageLabel: "03", sortOrder: 3 },
  { bookId: "digital-africa", title: "DIGITAL AFRICA", description: "Perspectives on connected communities, digital skills, and the future of work.", category: "community-and-access", readerUrl: "/innovation-lab/product/san-book", coverTitle: "DIGITAL\nAFRICA", coverSubtitle: "People, systems, possibility", accent: "#a65d35", coverInk: "#fff2d2", pageLabel: "04", sortOrder: 4 },
];

const TESTIMONIALS = [
  { name: "Aline M.", role: "SAN HUB learner", quote: "SAN HUB helped me move from learning concepts to building something people could actually use.", rating: 4.9, context: "san-hub", dateLabel: "12 Jun, 2024", sourceLabel: "Learner story", sortOrder: 1 },
  { name: "Eric N.", role: "Innovation program participant", quote: "The practical projects and mentorship gave our team the confidence to take an idea further.", rating: 4.8, context: "san-hub", dateLabel: "29 Aug, 2024", sourceLabel: "Innovation program", sortOrder: 2 },
  { name: "Diane U.", role: "Community partner", quote: "SAN HUB creates a useful bridge between technology skills, opportunity, and the needs of our community.", rating: 4.9, context: "san-hub", dateLabel: "14 Nov, 2024", sourceLabel: "Partner story", sortOrder: 3 },
];

const AWARDS = [
  { name: "SAN HUB trainee", year: "2026", title: "Best Performer", description: "Recognizing a trainee who stood out through commitment, practical work, and contribution during the SAN HUB learning journey.", category: "best-performer", featured: true, sortOrder: 1 },
];

const COURSE_DETAILS = {
  "full-stack-software-engineering": {
    subtitle: "Build dependable digital products from a real problem to a working release.",
    instructor: "SAN TECH Software Engineering Team",
    rating: 4.9,
    reviewCount: "38 learner reviews",
    stats: [{ label: "Course pathway", value: "4 project stages", detail: "Learn by building" }, { label: "Practical rating", value: "4.9 ★", detail: "From SAN HUB learners" }, { label: "Level", value: "Intermediate", detail: "Recommended experience" }, { label: "Schedule", value: "Flexible cohort", detail: "16 weeks to complete" }],
  },
  "applied-ai-machine-learning": {
    subtitle: "Use data, machine learning, and responsible AI to solve practical problems.",
    instructor: "SAN TECH AI & Data Team",
    rating: 4.8,
    reviewCount: "31 learner reviews",
    stats: [{ label: "Course pathway", value: "4 applied labs", detail: "Learn through experiments" }, { label: "Practical rating", value: "4.8 ★", detail: "From SAN HUB learners" }, { label: "Level", value: "All levels", detail: "Curiosity is enough to start" }, { label: "Schedule", value: "Weekend labs", detail: "12 weeks to complete" }],
  },
  "cybersecurity-defense": {
    subtitle: "Build the habits and systems needed to protect people, information, and operations.",
    instructor: "SAN TECH Cybersecurity Team",
    rating: 4.9,
    reviewCount: "27 learner reviews",
    stats: [{ label: "Course pathway", value: "3 intensive labs", detail: "Practice by scenario" }, { label: "Practical rating", value: "4.9 ★", detail: "From SAN HUB learners" }, { label: "Level", value: "Intermediate", detail: "Systems experience helps" }, { label: "Schedule", value: "Intensive labs", detail: "10 weeks to complete" }],
  },
};

for (const category of BOOK_CATEGORIES) await upsert("san-hub-book-categories", "slug", category);

for (const book of BOOKS) {
  const category = await findOne("san-hub-book-categories", "slug", book.category);
  await upsert("san-hub-books", "bookId", { ...book, category: category?.id ?? undefined });
}

for (const testimonial of TESTIMONIALS) await upsert("testimonials", "name", testimonial);
for (const award of AWARDS) await upsert("trainee-awards", "name", award);

for (const [itemId, detail] of Object.entries(COURSE_DETAILS)) {
  const course = await findOne("san-hub-catalog-items", "itemId", itemId);
  if (!course) {
    console.log(`Skipped course details; catalog item not found: ${itemId}`);
    continue;
  }
  await request(`/api/san-hub-catalog-items/${course.id}`, {
    method: "PUT",
    body: JSON.stringify({ data: { ...detail, publishedAt: new Date().toISOString() } }),
  });
  console.log(`Updated course details: ${itemId}`);
}

console.log("SAN HUB Phase 3 seed complete.");
