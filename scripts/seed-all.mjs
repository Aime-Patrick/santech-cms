/**
 * seed-all.mjs
 *
 * Seeds ALL collections from hardcoded frontend data into Strapi.
 *
 * Prerequisites:
 *   1. Strapi running  (`npm run dev` in cms/)
 *   2. Full-access API token from admin → Settings → API Tokens
 *
 * Usage:
 *   $env:STRAPI_API_TOKEN="<token>"; node scripts/seed-all.mjs
 *
 * Each collection is idempotent — existing records are skipped.
 * Run order matters: independent collections first.
 */

if (process.loadEnvFile) {
  try {
    process.loadEnvFile();
  } catch {}
}

const STRAPI_URL = (process.env.STRAPI_URL ?? "http://localhost:1337").replace(/\/$/, "");
const API_TOKEN  = process.env.STRAPI_API_TOKEN ?? "";

if (!API_TOKEN) {
  console.error(
    "\n❌  STRAPI_API_TOKEN is not set.\n" +
    "   Admin → Settings → API Tokens → Create new token (Full access)\n" +
    "   Then: $env:STRAPI_API_TOKEN='<token>'; node scripts/seed-all.mjs\n"
  );
  process.exit(1);
}

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

async function get(path) {
  const res = await fetch(`${STRAPI_URL}${path}`, {
    headers: { Authorization: `Bearer ${API_TOKEN}` },
  });
  if (!res.ok) throw new Error(`GET ${path} → ${res.status} ${res.statusText}`);
  return res.json();
}

async function post(path, body) {
  const res = await fetch(`${STRAPI_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_TOKEN}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST ${path} → ${res.status}: ${text}`);
  }
  return res.json();
}

async function put(path, body) {
  const res = await fetch(`${STRAPI_URL}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_TOKEN}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PUT ${path} → ${res.status}: ${text}`);
  }
  return res.json();
}

/** Fetch all existing slugs/ids for a collection to skip duplicates */
async function existingSlugs(endpoint, field = "slug") {
  try {
    const json = await get(`/api/${endpoint}?fields[0]=${field}&pagination[pageSize]=500&status=draft`);
    return new Set((json.data ?? []).map((d) => d[field] ?? d.attributes?.[field]));
  } catch {
    return new Set();
  }
}

async function existingTitles(endpoint) {
  return existingSlugs(endpoint, "title");
}

async function findOne(endpoint, field, value) {
  const json = await get(`/api/${endpoint}?filters[${field}][$eq]=${encodeURIComponent(value)}&pagination[pageSize]=1&status=draft`);
  return json.data?.[0] ?? null;
}

function toBlocks(paragraphs) {
  return paragraphs.map((text) => ({
    type: "paragraph",
    children: [{ type: "text", text }],
  }));
}

function publish() {
  return new Date().toISOString();
}

function log(emoji, msg) {
  console.log(`   ${emoji}  ${msg}`);
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. SITE STATS (home impact marquee)
// ═══════════════════════════════════════════════════════════════════════════

const SITE_STATS = [
  { value: 40,   suffix: "+",  label: "organizations & clients served",  sortOrder: 1 },
  { value: 2500, suffix: "+",  label: "SAN HUB beneficiaries",           sortOrder: 2 },
  { value: 17,   suffix: "+",  label: "countries reached",               sortOrder: 3 },
  { value: 15,   suffix: "+",  label: "technology professionals",        sortOrder: 4 },
  { value: 54,   suffix: "+",  label: "startup / innovation projects",   sortOrder: 5 },
  { value: 700,  suffix: "+",  label: "jobs & opportunities influenced", sortOrder: 6 },
  { value: 10,   suffix: "+",  label: "years combined leadership experience", sortOrder: 7 },
];

async function seedSiteStats() {
  console.log("\n📊  Seeding site-stats…");
  const existing = await existingTitles("site-stats");
  let created = 0, skipped = 0;

  for (const stat of SITE_STATS) {
    if (existing.has(stat.label)) { log("⏭", `Skip: ${stat.label}`); skipped++; continue; }
    try {
      await post("/api/site-stats", { data: { ...stat, publishedAt: publish() } });
      log("✅", `Created: ${stat.label}`);
      created++;
    } catch (e) { log("❌", `Failed: ${stat.label} — ${e.message}`); }
  }
  console.log(`   → ${created} created, ${skipped} skipped`);
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. PARTNER BRANDS
// ═══════════════════════════════════════════════════════════════════════════

const PARTNER_BRANDS = [
  { label: "Pallotti Presse Ltd", href: "https://pallottipresse.com/",  showLabel: true,  isGovernment: false, sortOrder: 1 },
  { label: "RICH Ubuzima",        href: "https://richubuzima.rw/",      showLabel: false, isGovernment: false, sortOrder: 2 },
  { label: "H&M Group",           href: "https://handmgroup.rw/",       showLabel: false, isGovernment: false, sortOrder: 3 },
  { label: "Eva Wellness Spa",    href: "https://www.evawellnessspa.com/", showLabel: false, isGovernment: false, sortOrder: 4 },
  { label: "BNR",                 href: "https://www.bnr.rw/",          showLabel: true,  isGovernment: false, sortOrder: 5 },
];

async function seedPartnerBrands() {
  console.log("\n🤝  Seeding partner-brands…");
  const existing = await existingTitles("partner-brands");
  let created = 0, skipped = 0;

  for (const brand of PARTNER_BRANDS) {
    if (existing.has(brand.label)) { log("⏭", `Skip: ${brand.label}`); skipped++; continue; }
    try {
      await post("/api/partner-brands", { data: { ...brand, publishedAt: publish() } });
      log("✅", `Created: ${brand.label}`);
      created++;
    } catch (e) { log("❌", `Failed: ${brand.label} — ${e.message}`); }
  }
  console.log(`   → ${created} created, ${skipped} skipped`);
  console.log("   👉  Upload logos manually in the Strapi admin for each partner brand.");
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. DRIVING CHANGE STORIES
// ═══════════════════════════════════════════════════════════════════════════

const DRIVING_CHANGE_STORIES = [
  { slug: "e-visitors-national-rollout-field-operations", sectionKey: "impact", category: "systems-in-use", categoryLabel: "Systems in use", title: "E-Visitors Deployment Across National & Commercial Facilities", publishedDate: "2026-06-24", readingTime: "4 min read", location: "Kigali & Regional Hubs", institution: "Public Sector & Corporate Towers", statLabel: "Daily Check-ins", statValue: "35,000+", excerpt: "SAN TECH field engineers deployed biometric scanning and automated identity verification across high-throughput public and corporate facilities.", body: ["SAN TECH engineers worked on the ground with security officers and facility managers to replace slow paper logbooks with automated optical document scanning and real-time host notifications.", "The field deployment streamlined security checkpoint queues by over 70%, ensuring complete audit compliance, emergency headcount visibility, and instant badge generation.", "Engineers conducted on-site user coaching for front-desk teams, verifying hardware resilience across peak morning rush hours."] },
  { slug: "smart-biometrics-access-control-integration", sectionKey: "impact", category: "systems-in-use", categoryLabel: "Systems in use", title: "Edge AI Biometric Access Control in High-Security Campuses", publishedDate: "2026-05-18", readingTime: "3 min read", location: "Kigali Innovation City", institution: "Enterprise Technology Parks", statLabel: "Inference Time", statValue: "< 120ms", excerpt: "Deploying low-latency edge computer vision devices for touchless access verification and perimeter security monitoring.", body: ["Our field team implemented neural inference at the edge, allowing gates to verify pre-registered personnel even during network disconnects.", "The system logs encrypted access telemetry and generates automatic anomaly alerts without transmitting sensitive biometric raw data to external servers."] },
  { slug: "municipal-document-tracking-and-verification", sectionKey: "impact", category: "systems-in-use", categoryLabel: "Systems in use", title: "Real-Time Document Verification & Public Queue Management", publishedDate: "2026-04-08", readingTime: "4 min read", location: "District Administrative Centres", institution: "Local Governance Offices", statLabel: "Processing Speed", statValue: "15 mins", excerpt: "Replacing paper files with QR-encoded cryptographic tracking, reducing citizen service processing time from 4 days to 15 minutes.", body: ["SAN TECH systems provide complete end-to-end provenance for municipal documents, ensuring transparency and eliminating lost physical files."] },
  { slug: "institutional-engineering-coaching-and-transfer", sectionKey: "impact", category: "learning-that-remains", categoryLabel: "Learning that remains", title: "Leaving Lasting Capability: Hands-On Partner Team Training", publishedDate: "2026-06-10", readingTime: "4 min read", location: "Kigali & Pan-African", institution: "Ministry & Enterprise IT Units", statLabel: "Engineers Upskilled", statValue: "450+", excerpt: "Every software and hardware system deployment includes exhaustive operational runbooks, architecture masterclasses, and code transfers.", body: ["We believe technology delivery is only half the journey. True success occurs when our clients' internal teams can independently maintain, debug, and evolve the systems.", "SAN TECH provided 6-week intensive engineering transfer clinics covering database backup protocols, disaster recovery drills, and container orchestration."] },
  { slug: "san-hub-institutional-certifications", sectionKey: "impact", category: "learning-that-remains", categoryLabel: "Learning that remains", title: "SAN HUB Professional Certifications for Enterprise IT Staff", publishedDate: "2026-05-02", readingTime: "3 min read", location: "SAN HUB Academy", institution: "Financial & Health Institutions", statLabel: "Certifications Issued", statValue: "180 Staff", excerpt: "Standardizing security best practices, GDPR/DPIA compliance protocols, and zero-trust principles across institutional partner teams.", body: ["Course modules emphasize practical diagnostic troubleshooting and disaster simulations rather than theoretical examinations."] },
  { slug: "open-documentation-and-developer-knowledgebase", sectionKey: "impact", category: "learning-that-remains", categoryLabel: "Learning that remains", title: "Open APIs, Interactive Documentation & Developer Playbooks", publishedDate: "2026-03-15", readingTime: "3 min read", location: "Online & Regional Labs", institution: "Developer Ecosystem", statLabel: "API Integrations", statValue: "85+ Apps", excerpt: "Publishing accessible documentation, SDKs, and code recipes so local developers can integrate with SAN TECH platforms effortlessly.", body: ["Accessible tooling and comprehensive SDKs in JavaScript, Python, and Go ensure that institutional ecosystems thrive long after initial rollout."] },
  { slug: "offline-first-architecture-low-bandwidth", sectionKey: "impact", category: "world-context", categoryLabel: "World context", title: "Offline-First Systems Engineered for Variable Connectivity", publishedDate: "2026-06-02", readingTime: "4 min read", location: "Rwanda & West Africa", institution: "Regional Field Deployments", statLabel: "Uptime Guaranteed", statValue: "99.98%", excerpt: "Designing resilient local caching and eventual consistency protocols that guarantee uninterrupted operations during grid and fiber disruptions.", body: ["Imported off-the-shelf software frequently breaks down when regional internet connections drop. SAN TECH builds offline-first architecture with local SQLite/IndexedDB replicas.", "Transactions, check-ins, and cryptographic logs synchronize automatically with central cloud nodes the moment connectivity is restored."] },
  { slug: "multilingual-vernacular-interfaces-rwanda", sectionKey: "impact", category: "world-context", categoryLabel: "World context", title: "Bilingual & Vernacular UX: Kinyarwanda, French, and English", publishedDate: "2026-04-20", readingTime: "3 min read", location: "Kigali, Rwanda", institution: "Civic Interfaces", statLabel: "Languages Supported", statValue: "3 Native", excerpt: "Ensuring every citizen and front-line officer can interact with technology naturally in their own native language and cultural context.", body: ["Our design systems incorporate native Kinyarwanda terminology alongside English and French to eliminate literacy and linguistic barriers for public users."] },
  { slug: "climate-resilient-hardware-packaging", sectionKey: "impact", category: "world-context", categoryLabel: "World context", title: "Thermal & Dust-Resilient Hardware Engineering for African Climates", publishedDate: "2026-02-28", readingTime: "3 min read", location: "Rwanda & Mali", institution: "Hardware Labs", statLabel: "Operating Range", statValue: "-5°C to 50°C", excerpt: "Custom enclosure designs with passive thermal dissipation and wide voltage tolerance engineered for equatorial conditions.", body: ["SAN TECH manufactures ruggedized casing with internal surge protection to withstand power fluctuations and ambient outdoor dust."] },
  { slug: "university-rwanda-hands-on-applied-ai-labs", sectionKey: "career", category: "practical-entry", categoryLabel: "Practical entry", title: "University of Rwanda Applied AI & Systems Architecture Labs", publishedDate: "2026-06-16", readingTime: "4 min read", location: "University of Rwanda (CST)", institution: "College of Science & Technology", statLabel: "Students Trained", statValue: "180+", excerpt: "Over 180 Computer Science and Electronics engineering undergraduates built real-time computer vision prototypes and edge inference pipelines.", body: ["SAN TECH engineers led 3-day practical workshops at CST Kigali. Students received embedded micro-controller kits to write real-time OpenCV and TensorRT code.", "Instead of textbook theory, students solved tangible regional challenges including traffic counting and touchless optical visitor verification."] },
  { slug: "secondary-school-stem-robotics-camps", sectionKey: "career", category: "practical-entry", categoryLabel: "Practical entry", title: "Secondary Schools STEM Robotics & Micro-Controller Camps", publishedDate: "2026-05-25", readingTime: "3 min read", location: "Kigali & Rural Districts", institution: "Secondary STEM Outreach", statLabel: "High School Students", statValue: "250+", excerpt: "Demystifying software engineering for 250+ secondary students across 8 schools through hands-on electronics and coding clinics.", body: ["SAN TECH's outreach team brought robotics kits and interactive logic software to classrooms, inspiring teenagers before university specialization."] },
  { slug: "kepler-and-alu-production-cicd-bootcamps", sectionKey: "career", category: "practical-entry", categoryLabel: "Practical entry", title: "Production CI/CD & Automated Testing at Kepler and ALU", publishedDate: "2026-04-14", readingTime: "4 min read", location: "Kigali Innovation City", institution: "ALU & Kepler College", statLabel: "Student Projects", statValue: "48 Deployed", excerpt: "Teaching industry engineering workflows: Git branch management, Docker containerization, Playwright test suites, and clean pull requests.", body: ["Equipping undergraduates with real production development habits so they are Day-1 ready for high-performing engineering teams."] },
  { slug: "san-tech-engineering-apprenticeship-program", sectionKey: "career", category: "mentorship-and-placement", categoryLabel: "Mentorship and placement", title: "SAN TECH 6-Month Paid Engineering Apprenticeship Cohorts", publishedDate: "2026-06-20", readingTime: "4 min read", location: "Kigali, Rwanda", institution: "SAN TECH Engineering Labs", statLabel: "Employment Rate", statValue: "98.4%", excerpt: "Transitioning top graduates directly from potential into real contribution through guided mentoring on live production enterprise systems.", body: ["Apprentices work side-by-side with senior architects on real client deliverables, receiving weekly code reviews, system design coaching, and career guidance.", "Over 98% of cohort apprentices successfully transition into full-time junior and mid-level software engineering positions."] },
  { slug: "women-in-tech-senior-leadership-circles", sectionKey: "career", category: "mentorship-and-placement", categoryLabel: "Mentorship and placement", title: "Women in Tech Mentorship & Engineering Leadership Circles", publishedDate: "2026-05-08", readingTime: "4 min read", location: "Kigali & Remote", institution: "SAN HUB Women in Tech", statLabel: "Mentees Advanced", statValue: "65 Engineers", excerpt: "1-on-1 career navigation, technical interview coaching, and senior architecture mentorship for emerging female engineers.", body: ["Connecting promising female engineers with CTOs and lead architects to build confidence, leadership skills, and executive negotiation capability."] },
  { slug: "executive-one-on-one-career-clinics", sectionKey: "career", category: "mentorship-and-placement", categoryLabel: "Mentorship and placement", title: "Executive Tech Clinics & Career Portfolio Reviews", publishedDate: "2026-03-22", readingTime: "3 min read", location: "SAN HUB Arena", institution: "SAN HUB Career Services", statLabel: "Clinics Hosted", statValue: "24 Sessions", excerpt: "Free monthly open clinics providing junior developers with honest resume critiques, code audits, and technical interview simulations.", body: ["Helping self-taught builders and university leavers present their software portfolio clearly to global and regional tech employers."] },
  { slug: "tech-forward-live-annual-summit", sectionKey: "career", category: "community-outreach", categoryLabel: "Community outreach", title: "Tech Forward Live: Connecting Builders, Students & Industry Leaders", publishedDate: "2026-06-05", readingTime: "5 min read", location: "Kigali Arena & Online", institution: "Tech Forward Live Summit", statLabel: "Summit Attendees", statValue: "1,200+", excerpt: "Gathering over 1,200 developers, students, researchers, and technology executives for keynote talks, live demos, and talent showcases.", body: ["Tech Forward Live is SAN TECH's flagship community summit. The event celebrates regional innovation, awards developer micro-grants, and showcases breakthrough African tech.", "The summit features hands-on demo pods where student teams present their working software prototypes directly to potential investors and employers."] },
  { slug: "open-community-hackathons-and-microgrants", sectionKey: "career", category: "community-outreach", categoryLabel: "Community outreach", title: "48-Hour Open Community Buildathons & Micro-Grants", publishedDate: "2026-04-28", readingTime: "4 min read", location: "SAN HUB Kigali", institution: "Community Hackathons", statLabel: "Grants Distributed", statValue: "$15,000", excerpt: "Funding high-impact civic prototypes with $15,000 in micro-grants, cloud hosting credits, and dedicated SAN HUB incubation space.", body: ["Weekend coding sprints focused on solving real municipal challenges, accessible public services, and open data visualization for African cities."] },
  { slug: "neighborhood-open-days-and-digital-literacy", sectionKey: "career", category: "community-outreach", categoryLabel: "Community outreach", title: "Neighborhood Open Days: Welcoming Families to the World of Tech", publishedDate: "2026-02-12", readingTime: "3 min read", location: "SAN HUB Campus", institution: "Community Open Days", statLabel: "Visitors Welcomed", statValue: "850+ Guests", excerpt: "Opening SAN TECH labs to parents, teachers, and school children to experience 3D printing, robotics, and interactive programming.", body: ["Making technology approachable, welcoming, and exciting for families across our surrounding neighborhoods."] },
];

async function seedDrivingChangeStories() {
  console.log("\n🌍  Seeding driving-change-stories…");
  const existing = await existingSlugs("driving-change-stories");
  let created = 0, skipped = 0;

  for (const story of DRIVING_CHANGE_STORIES) {
    if (existing.has(story.slug)) { log("⏭", `Skip: ${story.slug}`); skipped++; continue; }
    try {
      const { slug, body, ...rest } = story;
      await post("/api/driving-change-stories", {
        data: { ...rest, slug, body: toBlocks(body), publishedAt: publish() },
      });
      log("✅", `Created: ${slug}`);
      created++;
    } catch (e) { log("❌", `Failed: ${story.slug} — ${e.message}`); }
  }
  console.log(`   → ${created} created, ${skipped} skipped`);
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. SAN HUB CATALOG ITEMS
// ═══════════════════════════════════════════════════════════════════════════

const COURSE_CATEGORIES = [
  { name: "Web development", slug: "web-development", sortOrder: 1 },
  { name: "Artificial intelligence", slug: "artificial-intelligence", sortOrder: 2 },
  { name: "Cybersecurity", slug: "cybersecurity", sortOrder: 3 },
  { name: "IoT & connected devices", slug: "iot-connected-devices", sortOrder: 4 },
  { name: "Embedded technology", slug: "embedded-technology", sortOrder: 5 },
  { name: "Digital transformation", slug: "digital-transformation", sortOrder: 6 },
];
const SAN_HUB_CATALOG_ITEMS = [
  { itemId: "full-stack-software-engineering", category: "Courses", courseCategory: "web-development", title: "Full-Stack Software Engineering", provider: "SAN TECH / SAN HUB", description: "Build reliable web and platform experiences from user needs to deployment.", format: "Cohort", duration: "16 weeks", level: "Intermediate", badge: "Featured pathway", sortOrder: 1 },
  { itemId: "applied-ai-machine-learning", category: "Courses", courseCategory: "artificial-intelligence", title: "Applied AI & Machine Learning", provider: "SAN TECH / SAN HUB", description: "Use computer vision, analytics, and responsible AI to solve practical problems.", format: "Weekend labs", duration: "12 weeks", level: "All levels", sortOrder: 2 },
  { itemId: "cybersecurity-defense", category: "Courses", courseCategory: "cybersecurity", title: "Cybersecurity & Threat Intelligence", provider: "SAN TECH / SAN HUB", description: "Learn the habits, tools, and thinking needed to protect systems and information.", format: "Intensive labs", duration: "10 weeks", level: "Intermediate", sortOrder: 3 },
  { itemId: "build-with-ai", category: "Upcoming training", title: "Build with AI: practical problem solving", provider: "SAN HUB learning calendar", description: "A guided cohort for turning everyday challenges into useful, testable AI workflows.", format: "Evening cohort", duration: "Starts 14 Oct 2026", level: "Beginner friendly", badge: "Next cohort", sortOrder: 4 },
  { itemId: "digital-product-workshop", category: "Upcoming training", title: "Designing a useful digital product", provider: "SAN HUB learning calendar", description: "A focused workshop on research, prototyping, and making a product easier to use.", format: "One-day workshop", duration: "03 Nov 2026", level: "Open to all", sortOrder: 5 },
  { itemId: "innovation-challenge-lab", category: "Innovation programs", title: "Innovation Challenge Lab", provider: "SAN TECH innovation team", description: "Move a promising question from research and prototyping toward a tested possibility.", format: "Challenge lab", duration: "8-week cycle", level: "Teams and innovators", badge: "Build with us", sortOrder: 6 },
  { itemId: "startup-product-studio", category: "Innovation programs", title: "Startup & Product Studio", provider: "SAN HUB innovation programs", description: "Shape an early idea through validation, product thinking, mentorship, and partner feedback.", format: "Studio program", duration: "Rolling intake", level: "Early-stage teams", sortOrder: 7 },
  { itemId: "software-apprenticeship", category: "Apprenticeships / Internships", title: "Software Engineering Apprenticeship", provider: "SAN TECH delivery teams", description: "Learn through guided contribution to real systems, reviews, and team delivery habits.", format: "Placement", duration: "3–6 months", level: "Emerging practitioners", sortOrder: 8 },
  { itemId: "innovation-internship", category: "Apprenticeships / Internships", title: "Innovation & Research Internship", provider: "SAN TECH research team", description: "Work with researchers and builders to explore context, evidence, prototypes, and impact.", format: "Mentored placement", duration: "By placement", level: "Students and graduates", sortOrder: 9 },
  { itemId: "team-digital-transformation", category: "Upskilling programs", title: "Digital Transformation for Teams", provider: "SAN HUB professional learning", description: "Help teams move from disconnected work to clearer digital processes and systems.", format: "Team programme", duration: "Custom schedule", level: "Organizations", badge: "For teams", sortOrder: 10 },
  { itemId: "ai-literacy-for-work", category: "Upskilling programs", title: "AI Literacy for Everyday Work", provider: "SAN HUB professional learning", description: "Build practical confidence with AI tools, responsible use, and better everyday decisions.", format: "Short programme", duration: "2–4 weeks", level: "Professionals", sortOrder: 11 },
  { itemId: "innovation-open-day", category: "Events", title: "SAN TECH Innovation Open Day", provider: "SAN TECH community", description: "Meet builders, see working demos, and find practical ways to participate in the ecosystem.", format: "Showcase and demos", duration: "21 Nov 2026", level: "Open to all", badge: "Community event", sortOrder: 12 },
  { itemId: "tech-community-talks", category: "Events", title: "SAN HUB Tech Community Talks", provider: "SAN HUB events", description: "Join conversations with practitioners, mentors, and innovators working on useful technology.", format: "Talks and panels", duration: "Monthly", level: "Open to all", sortOrder: 13 },
  { itemId: "devbreak", category: "Programs", title: "DevBreak", provider: "SAN HUB programs", description: "Intensive practical technology learning for people ready to build, test, and apply useful ideas.", format: "SAN HUB program", duration: "Scheduled or rolling intake", level: "Learners and builders", sortOrder: 14 },
  { itemId: "capacity-building", category: "Programs", title: "Professional Capacity Building", provider: "SAN HUB programs", description: "Strengthen the technical, digital, and collaboration skills that help people and teams deliver.", format: "SAN HUB program", duration: "Scheduled or rolling intake", level: "Professionals and teams", sortOrder: 15 },
  { itemId: "research-development", category: "Programs", title: "Research & Development", provider: "SAN HUB programs", description: "Explore meaningful questions through applied research, experimentation, prototypes, and product development.", format: "SAN HUB program", duration: "Scheduled or rolling intake", level: "Researchers and innovators", sortOrder: 16 },
  { itemId: "apprenticeship", category: "Programs", title: "Apprenticeship", provider: "SAN HUB programs", description: "Learn through guided practice, mentorship, and contribution to real technology projects.", format: "SAN HUB program", duration: "Scheduled or rolling intake", level: "Emerging practitioners", sortOrder: 17 },
];

async function seedSanHubCatalogItems() {
  console.log("\nSeeding san-hub-catalog-items...");
  const categoryBySlug = new Map();
  let created = 0, skipped = 0;

  for (const category of COURSE_CATEGORIES) {
    const record = await findOne("course-categories", "slug", category.slug);
    if (record) {
      categoryBySlug.set(category.slug, record);
      continue;
    }
    const createdCategory = await post("/api/course-categories", { data: { ...category, isActive: true, publishedAt: publish() } });
    categoryBySlug.set(category.slug, createdCategory.data);
    log("OK", `Created course category: ${category.name}`);
  }

  for (const item of SAN_HUB_CATALOG_ITEMS) {
    const { courseCategory: categorySlug, ...catalogItem } = item;
    const category = categorySlug ? categoryBySlug.get(categorySlug) : null;
    try {
      const existingItem = await findOne("san-hub-catalog-items", "itemId", item.itemId);
      if (existingItem) {
        if (category) await put(`/api/san-hub-catalog-items/${existingItem.documentId}`, { data: { courseCategory: category.documentId } });
        log("SKIP", `Existing: ${item.itemId}`);
        skipped++;
        continue;
      }
      await post("/api/san-hub-catalog-items", { data: { ...catalogItem, ...(category ? { courseCategory: category.documentId } : {}), publishedAt: publish() } });
      log("OK", `Created: ${item.itemId}`);
      created++;
    } catch (e) { log("FAIL", `Failed: ${item.itemId} - ${e.message}`); }
  }
  console.log(`   -> ${created} created, ${skipped} skipped`);
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. OPPORTUNITIES (Tech Pulse opportunities tab)
// ═══════════════════════════════════════════════════════════════════════════

const OPPORTUNITIES = [
  { title: "SAN HUB Tech & AI Innovation Fellowship 2026", type: "Fellowship", badge: "Fellowship", description: "A full scholarship and incubation pathway for African developers building high-impact AI and embedded systems.", deadline: "Open until Nov 30, 2026", href: "/san-hub", sortOrder: 1 },
  { title: "Digital Public Infrastructure Accelerator (50-in-5)", type: "Grant", badge: "Incubation", description: "Hands-on acceleration for teams building open-source, interoperable identity, data exchange, and digital credential modules.", deadline: "Applications open", href: "/connect", sortOrder: 2 },
  { title: "IoT Hardware & Edge Computing Prototype Grants", type: "Grant", badge: "Prototype Grant", description: "Grants and lab access for engineering cohorts prototyping smart municipal monitoring and sensor networks.", deadline: "Cohort 4 Intake", href: "/connect", sortOrder: 3 },
  { title: "Senior Full-Stack Software Engineer (Next.js / Node.js)", type: "Job", badge: "Full-Time", description: "Lead the core engineering team building high-availability enterprise applications and distributed backend microservices.", deadline: "Immediate", href: "/join-the-community?role=Intern", sortOrder: 4 },
  { title: "Cybersecurity Analyst & SOC Operations Specialist", type: "Job", badge: "Full-Time", description: "Oversee data controller compliance, automated penetration audits, and real-time security monitoring for client infrastructures.", deadline: "Open now", href: "/join-the-community?role=Intern", sortOrder: 5 },
  { title: "Junior Software Developer Apprenticeship (Cohort 5)", type: "Internship", badge: "Paid Apprenticeship", description: "Accelerated 6-month hands-on apprenticeship working directly on production deployments under senior mentor guidance.", deadline: "Applications by cohort", href: "/join-the-community?role=Intern", sortOrder: 6 },
  { title: "SAN TECH Innovation Open Day", type: "Event", badge: "Community Event", description: "Meet builders, see working demos, and find practical ways to participate in the ecosystem.", deadline: "21 Nov 2026", href: "/tech-pulse", sortOrder: 7 },
];

async function seedOpportunities() {
  console.log("\n💼  Seeding opportunities…");
  const existing = await existingTitles("opportunities");
  let created = 0, skipped = 0;

  for (const opp of OPPORTUNITIES) {
    if (existing.has(opp.title)) { log("⏭", `Skip: ${opp.title}`); skipped++; continue; }
    try {
      await post("/api/opportunities", { data: { ...opp, publishedAt: publish() } });
      log("✅", `Created: ${opp.title}`);
      created++;
    } catch (e) { log("❌", `Failed: ${opp.title} — ${e.message}`); }
  }
  console.log(`   → ${created} created, ${skipped} skipped`);
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. RECOGNITION (Our Legacy)
// ═══════════════════════════════════════════════════════════════════════════

const RECOGNITIONS = [
  { year: "2026", title: "Best Exhibitor in ICT & Innovation", description: "SAN TECH was recognized as Best Exhibitor in ICT and Innovation at the 29th Rwanda International Trade Fair (Expo 2026), emerging top among 494 participating companies for outstanding technological innovation and ecosystem delivery.", badge: "Expo 2026 Winner", sortOrder: 1 },
  { year: "2026", title: "Tech Forward Live 2026 Summit", description: "SAN TECH convened Tech Forward Live 2026 under the theme 'Turning Ideas into Impact', bringing together youth innovators, government leaders, university partners, and industry experts.", badge: "Flagship Summit", sortOrder: 2 },
  { year: "2025", title: "Rwanda NCSA – Data Protection/Data Controller Certification", description: "SAN TECH received Data Protection and Data Controller certification from the Rwanda National Cyber Security Authority.", badge: "Data Processor Certificate", sortOrder: 3 },
  { year: "2025", title: "Digital Bridge Institute – EdTech Recognition", description: "SAN TECH received an EdTech Seal from the Digital Bridge Institute in 2025.", sortOrder: 4 },
  { year: "2024", title: "Bridge International / TBI Global Impact Recognition", description: "SAN TECH received recognition from The Bridge International (TBI) for its global and sustainable impact in 2024.", sortOrder: 5 },
  { year: "2023", title: "Central Bank of Rwanda (BNR) – E-Visitors Institutional Adoption", description: "In 2023, SAN TECH recorded a major industry-validation milestone when its E-Visitors System was adopted by the National Bank of Rwanda (BNR).", sortOrder: 6 },
  { year: "2022", title: "Generation Unlimited / UNICEF Recognition", description: "SAN TECH received the Best Performing Entrepreneurs Award through Generation Unlimited and UNICEF in 2022.", sortOrder: 7 },
  { year: "2021", title: "National Recognition for COVID-19 Recovery Capacity", description: "SAN TECH received national recognition in 2021 for supporting institutional COVID-19 recovery and resilience through technology.", sortOrder: 8 },
  { year: "2019", title: "Innovate for Industry Hackathon Winner", description: "SAN TECH's E-Visitors project emerged as one of the winners of the Innovate for Industry Hackathon organized by NIRDA.", sortOrder: 9 },
  { year: "", title: "AMI Resilience Prize", description: "The E-Visitors project received recognition through the AMI Resilience Prize, associated with AMI Rwanda and the Youth Challenge Programme.", sortOrder: 10 },
  { year: "", title: "E-Visitors Intellectual Property", description: "SAN TECH secured intellectual-property rights for its E-Visitors innovation.", sortOrder: 11 },
  { year: "", title: "Cybersecurity / Technical Verification", description: "E-Visitors was verified and approved by the relevant cybersecurity institution (NCSA).", sortOrder: 12 },
];

async function seedRecognitions() {
  console.log("\n🏆  Seeding recognitions…");
  const existing = await existingTitles("recognitions");
  let created = 0, skipped = 0;

  for (const rec of RECOGNITIONS) {
    if (existing.has(rec.title)) { log("⏭", `Skip: ${rec.title}`); skipped++; continue; }
    try {
      await post("/api/recognitions", { data: { ...rec, publishedAt: publish() } });
      log("✅", `Created: ${rec.title}`);
      created++;
    } catch (e) { log("❌", `Failed: ${rec.title} — ${e.message}`); }
  }
  console.log(`   → ${created} created, ${skipped} skipped`);
  console.log("   👉  Upload award images manually in the Strapi admin.");
}

// ═══════════════════════════════════════════════════════════════════════════
// 7. TEAM MEMBERS (Our Legacy leadership)
// ═══════════════════════════════════════════════════════════════════════════

const TEAM_MEMBERS = [
  { name: "Shema Pacifique", position: "Founder & CEO", department: "Executive", expertise: "Technology leadership", bio: "Founder and Chief Executive Officer of SAN TECH.", linkedIn: "https://www.linkedin.com/in/shema-pacifique-6b9321164/", sortOrder: 1 },
  { name: "Claudine Niyonzima", position: "Co-founder & COO/CFO", department: "Executive", expertise: "Operations & Finance", bio: "Co-founder, Chief Operating Officer and Chief Financial Officer.", linkedIn: "https://www.linkedin.com/in/claudine-niyonzima-3584a6240/", sortOrder: 2 },
  { name: "Felix", position: "Software Developer", department: "Software Engineering", expertise: "Software development", bio: "Building practical digital products and reliable systems at SAN TECH.", linkedIn: "https://www.linkedin.com/company/santechinnovate", sortOrder: 3 },
  { name: "Placide", position: "Software Developer", department: "Software Engineering", expertise: "Software development", bio: "Building practical digital products and reliable systems at SAN TECH.", linkedIn: "https://www.linkedin.com/company/santechinnovate", sortOrder: 4 },
  { name: "Aime Patrick", position: "Software Developer", department: "Software Engineering", expertise: "Software development", bio: "Builders turning practical requirements into reliable digital systems at SAN TECH.", linkedIn: "https://www.linkedin.com/company/santechinnovate", sortOrder: 5 },
  { name: "KAMI", position: "IoT & Hardware", department: "IoT & Hardware", expertise: "IoT & Hardware", bio: "Builders turning practical requirements into reliable digital systems.", linkedIn: "https://www.linkedin.com/company/santechinnovate", sortOrder: 6 },
  { name: "Ndayishimiye G. Bonheur", position: "Software Developer", department: "Software Engineering", expertise: "Full-stack systems, APIs, product delivery", bio: "Builders turning practical requirements into reliable digital systems.", linkedIn: "https://www.linkedin.com/company/santechinnovate", sortOrder: 7 },
  { name: "Mbabazi Sarah", position: "Software Developer", department: "Software Engineering", expertise: "Full-stack systems, APIs, product delivery", bio: "Builders turning practical requirements into reliable digital systems.", linkedIn: "https://www.linkedin.com/company/santechinnovate", sortOrder: 8 },
  { name: "Chris Umurerwa", position: "Sales & Marketing Lead", department: "Sales & Marketing", expertise: "Sales & Marketing", bio: "Driving growth through strategic market engagement and client partnerships.", linkedIn: "https://www.linkedin.com/company/santechinnovate", sortOrder: 9 },
  { name: "CYUSA Saleh", position: "Sales & Marketing Lead", department: "Sales & Marketing", expertise: "Sales & Marketing", bio: "Driving growth through strategic market engagement and client partnerships.", linkedIn: "https://www.linkedin.com/company/santechinnovate", sortOrder: 10 },
  { name: "Emmanuel", position: "IoT & Hardware Lead", department: "IoT & Hardware", expertise: "IoT & Hardware", bio: "Driving growth through strategic market engagement and client partnerships.", linkedIn: "https://www.linkedin.com/company/santechinnovate", sortOrder: 11 },
  { name: "Hertilan", position: "Software Developer", department: "Software Engineering", expertise: "Software development", bio: "Building practical digital products and reliable systems at SAN TECH.", linkedIn: "https://www.linkedin.com/company/santechinnovate", sortOrder: 12 },
  { name: "Yves", position: "Software Developer", department: "Software Engineering", expertise: "Software development", bio: "Building practical digital products and reliable systems at SAN TECH.", linkedIn: "https://www.linkedin.com/company/santechinnovate", sortOrder: 13 },
];

async function seedTeamMembers() {
  console.log("\n👥  Seeding team-members…");
  const existing = await existingTitles("team-members");
  let created = 0, skipped = 0;

  for (const member of TEAM_MEMBERS) {
    if (existing.has(member.name)) { log("⏭", `Skip: ${member.name}`); skipped++; continue; }
    try {
      await post("/api/team-members", { data: { ...member, publishedAt: publish() } });
      log("✅", `Created: ${member.name}`);
      created++;
    } catch (e) { log("❌", `Failed: ${member.name} — ${e.message}`); }
  }
  console.log(`   → ${created} created, ${skipped} skipped`);
  console.log("   👉  Upload member photos manually in the Strapi admin.");
}

// ═══════════════════════════════════════════════════════════════════════════
// 8. TESTIMONIALS (E-Visitors)
// ═══════════════════════════════════════════════════════════════════════════

const TESTIMONIALS = [
  { name: "Aline M.", role: "Institutional operations partner", quote: "E-Visitors gives reception and security one clear record from arrival to departure. The team can see what is happening and act faster.", rating: 5, sortOrder: 1 },
  { name: "Eric N.", role: "Security operations lead", quote: "The approval flow makes every visit easier to verify. We spend less time searching for information and more time keeping the site ready.", rating: 5, sortOrder: 2 },
  { name: "Diane U.", role: "Reception and access partner", quote: "Our teams now share the same view of guests, hosts, appointments, and access decisions. It has made daily coordination much clearer.", rating: 5, sortOrder: 3 },
  { name: "Patrick K.", role: "Institutional systems partner", quote: "The audit trail is useful because every important action is easy to follow. It gives leadership more confidence in the process.", rating: 5, sortOrder: 4 },
  { name: "Mugisha R.", role: "Visitor services partner", quote: "Visitors receive a more professional welcome, while our staff get a simpler way to manage people and movement on site.", rating: 5, sortOrder: 5 },
];

async function seedTestimonials() {
  console.log("\n⭐  Seeding testimonials…");
  const existing = await existingTitles("testimonials");
  let created = 0, skipped = 0;

  for (const t of TESTIMONIALS) {
    if (existing.has(t.name)) { log("⏭", `Skip: ${t.name}`); skipped++; continue; }
    try {
      await post("/api/testimonials", { data: { ...t, publishedAt: publish() } });
      log("✅", `Created: ${t.name}`);
      created++;
    } catch (e) { log("❌", `Failed: ${t.name} — ${e.message}`); }
  }
  console.log(`   → ${created} created, ${skipped} skipped`);
  console.log("   👉  Upload avatar photos manually in the Strapi admin.");
}

// ═══════════════════════════════════════════════════════════════════════════
// 9. CONTACT INFO (single type — PUT not POST)
// ═══════════════════════════════════════════════════════════════════════════

async function seedContactInfo() {
  console.log("\n📞  Seeding contact-info (single type)…");
  try {
    await put("/api/contact-info", {
      data: {
        phone1: "+250 783 250 033",
        phone2: "+250 780 309 833",
        whatsapp: "+250 727 923 756",
        email: "info@santechconnect.com",
        emailAlt: "santechrw@gmail.com",
        address: "Plot 48, KN 1 Road, Sofaru Building, 3rd Floor, Muhima, Kigali, Rwanda",
        radioUrl: "https://zeno.fm/radio/san-tech/",
        radioLabel: "SAN TECH Radio · Zeno.FM",
        mapsEmbedUrl: "https://www.google.com/maps?q=SAN+TECH,+Sofaru+Building,+Plot+48,+KN+1+Road,+Muhima,+Kigali,+Rwanda&z=18&output=embed",
        mapsDirectionsUrl: "https://www.google.com/maps/dir/?api=1&destination=Sofaru+Building,+Plot+48,+KN+1+Road,+Muhima,+Kigali,+Rwanda",
        publishedAt: publish(),
      },
    });
    log("✅", "Contact info saved.");
  } catch (e) {
    log("❌", `Failed: ${e.message}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  console.log(`\n🚀  Seeding all collections → ${STRAPI_URL}\n`);

  await seedSiteStats();
  await seedPartnerBrands();
  await seedDrivingChangeStories();
  await seedSanHubCatalogItems();
  await seedOpportunities();
  await seedRecognitions();
  await seedTeamMembers();
  await seedTestimonials();
  await seedContactInfo();

  console.log("\n✨  All done!\n");
  console.log("   Items that need manual image uploads:");
  console.log("   • Partner brands — logos");
  console.log("   • Driving change stories — cover images");
  console.log("   • SAN HUB catalog items — images");
  console.log("   • Recognition — award photos");
  console.log("   • Team members — photos");
  console.log("   • Testimonials — avatar photos");
  console.log("   • Tech Pulse articles — cover images (if not already done)\n");
}

main().catch((err) => {
  console.error("\n💥  Unexpected error:", err);
  process.exit(1);
});
