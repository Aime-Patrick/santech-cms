/**
 * Seeds the CMS-backed SAN HUB content introduced in Phase 3.
 *
 * Usage:
 *   $env:STRAPI_API_TOKEN="<token>"; node scripts/seed-san-hub.mjs
 *
 * The script is safe to rerun: records are matched by their stable UID/key
 * and updated instead of duplicated.
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
    await request(`/api/${endpoint}/${existing.documentId}`, { method: "PUT", body: JSON.stringify(payload) });
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

const COURSE_CATEGORIES = [
  { name: "Web development", slug: "web-development", sortOrder: 1 },
  { name: "Artificial intelligence", slug: "artificial-intelligence", sortOrder: 2 },
  { name: "Cybersecurity", slug: "cybersecurity", sortOrder: 3 },
  { name: "IoT & connected devices", slug: "iot-connected-devices", sortOrder: 4 },
  { name: "Embedded technology", slug: "embedded-technology", sortOrder: 5 },
  { name: "Digital transformation", slug: "digital-transformation", sortOrder: 6 },
];

const COURSE_CATEGORY_BY_SLUG = {
  "full-stack-software-engineering": "web-development",
  "applied-ai-machine-learning": "artificial-intelligence",
  "cybersecurity-defense": "cybersecurity",
};

const BOOKS = [
  { bookId: "san-book", title: "SAN BOOK", description: "Digital learning, academic resources, and practical guides from the SAN ecosystem.", category: "learning-systems", readerUrl: "/innovation-lab/product/san-book", coverTitle: "SAN BOOK", coverSubtitle: "Useful technology\nstronger systems", accent: "#0a1f44", coverInk: "#e8fbff", pageLabel: "01", sortOrder: 1 },
  { bookId: "ai-playbook", title: "AI PLAYBOOK", description: "A practical introduction to building useful AI products and workflows.", category: "artificial-intelligence", readerUrl: "/innovation-lab/product/san-book", coverTitle: "AI\nPLAYBOOK", coverSubtitle: "Build with intelligence", accent: "#087ea4", coverInk: "#f2ffff", pageLabel: "02", sortOrder: 2 },
  { bookId: "field-notes", title: "FIELD NOTES", description: "Stories, methods, and lessons from projects making technology more useful.", category: "impact-and-innovation", readerUrl: "/innovation-lab/product/san-book", coverTitle: "FIELD\nNOTES", coverSubtitle: "Impact and innovation", accent: "#355c4c", coverInk: "#fff7d7", pageLabel: "03", sortOrder: 3 },
  { bookId: "digital-africa", title: "DIGITAL AFRICA", description: "Perspectives on connected communities, digital skills, and the future of work.", category: "community-and-access", readerUrl: "/innovation-lab/product/san-book", coverTitle: "DIGITAL\nAFRICA", coverSubtitle: "People, systems, possibility", accent: "#a65d35", coverInk: "#fff2d2", pageLabel: "04", sortOrder: 4 },
];

const TESTIMONIALS = [
  { name: "Aline M.", role: "SAN HUB learner", quote: "SAN HUB helped me move from learning concepts to building something people could actually use.", rating: 5, context: "san-hub", dateLabel: "12 Jun, 2024", sourceLabel: "Learner story", sortOrder: 1 },
  { name: "Eric N.", role: "Innovation program participant", quote: "The practical projects and mentorship gave our team the confidence to take an idea further.", rating: 5, context: "san-hub", dateLabel: "29 Aug, 2024", sourceLabel: "Innovation program", sortOrder: 2 },
  { name: "Diane U.", role: "Community partner", quote: "SAN HUB creates a useful bridge between technology skills, opportunity, and the needs of our community.", rating: 5, context: "san-hub", dateLabel: "14 Nov, 2024", sourceLabel: "Partner story", sortOrder: 3 },
];

const AWARDS = [
  { name: "SAN HUB trainee", year: "2026", title: "Best Performer", description: "Recognizing a trainee who stood out through commitment, practical work, and contribution during the SAN HUB learning journey.", category: "best-performer", featured: true, sortOrder: 1 },
];

const COURSE_DETAILS = {
  "full-stack-software-engineering": {
    subtitle: "Build dependable digital products from a real problem to a working release.",
    instructor: "SAN TECH Software Engineering Team",
    rating: 5,
    reviewCount: "38 learner reviews",
    stats: [{ label: "Course pathway", value: "4 project stages", detail: "Learn by building" }, { label: "Practical rating", value: "5 ★", detail: "From SAN HUB learners" }, { label: "Level", value: "Intermediate", detail: "Recommended experience" }, { label: "Schedule", value: "Flexible cohort", detail: "16 weeks to complete" }],
  },
  "applied-ai-machine-learning": {
    subtitle: "Use data, machine learning, and responsible AI to solve practical problems.",
    instructor: "SAN TECH AI & Data Team",
    rating: 5,
    reviewCount: "31 learner reviews",
    stats: [{ label: "Course pathway", value: "4 applied labs", detail: "Learn through experiments" }, { label: "Practical rating", value: "5 ★", detail: "From SAN HUB learners" }, { label: "Level", value: "All levels", detail: "Curiosity is enough to start" }, { label: "Schedule", value: "Weekend labs", detail: "12 weeks to complete" }],
  },
  "cybersecurity-defense": {
    subtitle: "Build the habits and systems needed to protect people, information, and operations.",
    instructor: "SAN TECH Cybersecurity Team",
    rating: 5,
    reviewCount: "27 learner reviews",
    stats: [{ label: "Course pathway", value: "3 intensive labs", detail: "Practice by scenario" }, { label: "Practical rating", value: "5 ★", detail: "From SAN HUB learners" }, { label: "Level", value: "Intermediate", detail: "Systems experience helps" }, { label: "Schedule", value: "Intensive labs", detail: "10 weeks to complete" }],
  },
};

const COURSE_SKILLS = {
  "full-stack-software-engineering": ["TypeScript", "React", "Next.js", "API design", "PostgreSQL", "Testing", "Git workflows", "Cloud deployment"],
  "applied-ai-machine-learning": ["Data analysis", "Python", "Machine learning", "Computer vision", "Prompt design", "Model evaluation", "Responsible AI", "Storytelling"],
  "cybersecurity-defense": ["Threat modeling", "Network security", "Vulnerability assessment", "Identity and access", "Incident response", "Risk analysis", "Audit trails", "Security culture"],
};

const COURSE_TOOLS = {
  "full-stack-software-engineering": ["VS Code", "GitHub", "PostgreSQL", "Figma", "Vercel"],
  "applied-ai-machine-learning": ["Python", "Jupyter", "OpenAI APIs", "Power BI", "GitHub"],
  "cybersecurity-defense": ["Linux", "Wireshark", "OWASP tools", "SIEM concepts", "GitHub"],
};

const toSlug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

for (const category of BOOK_CATEGORIES) await upsert("san-hub-book-categories", "slug", category);
for (const category of COURSE_CATEGORIES) await upsert("course-categories", "slug", { ...category, isActive: true });

for (const [courseSlug, categorySlug] of Object.entries(COURSE_CATEGORY_BY_SLUG)) {
  const course = await findOne("san-hub-catalog-items", "slug", courseSlug);
  const category = await findOne("course-categories", "slug", categorySlug);
  if (!course || !category) continue;
  await request(`/api/san-hub-catalog-items/${course.documentId}`, {
    method: "PUT",
    body: JSON.stringify({ data: { courseCategory: category.documentId } }),
  });
}

for (const book of BOOKS) {
  const category = await findOne("san-hub-book-categories", "slug", book.category);
  await upsert("san-hub-books", "bookId", { ...book, category: category?.documentId ?? undefined });
}

for (const testimonial of TESTIMONIALS) await upsert("testimonials", "name", testimonial);
for (const award of AWARDS) await upsert("trainee-awards", "name", award);

for (const [courseSlug, detail] of Object.entries(COURSE_DETAILS)) {
  const course = await findOne("san-hub-catalog-items", "slug", courseSlug);
  if (!course) {
    console.log(`Skipped course details; catalog item not found: ${courseSlug}`);
    continue;
  }
  await request(`/api/san-hub-catalog-items/${course.documentId}`, {
    method: "PUT",
    body: JSON.stringify({ data: { ...detail, publishedAt: new Date().toISOString() } }),
  });
  console.log(`Updated course details: ${courseSlug}`);
}

for (const courseSlug of Object.keys(COURSE_SKILLS)) {
  const course = await findOne("san-hub-catalog-items", "slug", courseSlug);
  if (!course) continue;

  const skillRecords = [];
  for (const [sortOrder, name] of COURSE_SKILLS[courseSlug].entries()) {
    await upsert("course-skills", "slug", { name, slug: toSlug(name), category: "Course skill", sortOrder });
    skillRecords.push(await findOne("course-skills", "slug", toSlug(name)));
  }

  const toolRecords = [];
  for (const [sortOrder, name] of COURSE_TOOLS[courseSlug].entries()) {
    await upsert("course-tools", "slug", { name, slug: toSlug(name), category: "Course tool", sortOrder });
    toolRecords.push(await findOne("course-tools", "slug", toSlug(name)));
  }

  await request(`/api/san-hub-catalog-items/${course.documentId}`, {
    method: "PUT",
    body: JSON.stringify({
      data: {
        skills: { set: skillRecords.filter(Boolean).map((item) => item.documentId) },
        tools: { set: toolRecords.filter(Boolean).map((item) => item.documentId) },
      },
    }),
  });
  console.log(`Linked skills and tools: ${courseSlug}`);
}

console.log("SAN HUB Phase 3 seed complete.");
