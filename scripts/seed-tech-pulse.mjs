/**
 * seed-tech-pulse.mjs
 *
 * Imports the hardcoded Tech Pulse articles into Strapi via the REST API.
 *
 * Prerequisites:
 *   1. Strapi is running  (`npm run dev` inside the cms/ folder)
 *   2. You have created a full-access API token in the Strapi admin:
 *      Settings → API Tokens → Create new token (type: Full access)
 *   3. Pass the token via env:
 *        STRAPI_API_TOKEN=<your-token> node scripts/seed-tech-pulse.mjs
 *
 * The script is idempotent: it checks whether a slug already exists before
 * creating it, so running it twice is safe.
 *
 * Article body (string[]) is converted to Strapi "blocks" format (paragraphs).
 */

// ─── Config ──────────────────────────────────────────────────────────────────
if (process.loadEnvFile) {
  try {
    process.loadEnvFile();
  } catch {}
}

const STRAPI_URL = process.env.STRAPI_URL?.replace(/\/$/, "") ?? "http://localhost:1337";
const API_TOKEN  = process.env.STRAPI_API_TOKEN ?? "";

if (!API_TOKEN) {
  console.error(
    "\n❌  STRAPI_API_TOKEN is not set.\n" +
    "   Generate one in the Strapi admin → Settings → API Tokens → Create new token (Full access)\n" +
    "   Then run:\n" +
    "   STRAPI_API_TOKEN=<token> node scripts/seed-tech-pulse.mjs\n"
  );
  process.exit(1);
}

// ─── Hardcoded article data (copied from santech-f/lib/tech-pulse-data.ts) ───
// Keep this in sync if you update the source file before migrating fully.

const techPulseArticles = [
  // FELLOWSHIP
  {
    slug: "san-hub-tech-ai-innovation-fellowship-2026",
    category: "fellowship",
    title: "SAN HUB Tech & AI Innovation Fellowship 2026",
    publishedDate: "2026-06-18",
    readingTime: "4 min read",
    coverImageAlt: "A community group celebrating a technology and innovation graduation",
    excerpt: "A practical pathway for African builders who want to learn, prototype, and turn useful ideas into technology with lasting impact.",
    body: [
      "The SAN HUB Tech & AI Innovation Fellowship brings together learners, developers, researchers, and mentors around practical problems that matter in African communities.",
      "The fellowship combines guided learning, project work, mentorship, and opportunities to test ideas in real environments. Participants leave with stronger technical capability and a clearer path from prototype to impact.",
      "Applications, eligibility, and cohort dates will be published through SAN HUB as the next intake opens.",
    ],
  },
  {
    slug: "fellowship-cohort-applied-ai-robotics",
    category: "fellowship",
    title: "Cohort 4: Applied AI & Robotics Hardware Incubation",
    publishedDate: "2026-05-24",
    readingTime: "3 min read",
    coverImageAlt: "Fellowship cohort working on IoT and robotics hardware",
    excerpt: "Young engineering teams prototype IoT sensors, edge AI cameras, and automated monitoring systems for regional deployment.",
    body: [
      "The Applied AI & Robotics track provides dedicated hardware labs, sensor development kits, and cloud infrastructure for fellows building physical compute systems.",
      "Selected prototypes will receive pilot testing support across municipal facilities and partner agricultural stations in Rwanda.",
    ],
  },
  {
    slug: "women-in-cybersecurity-leadership-fellowship",
    category: "fellowship",
    title: "Advancing Women in Cybersecurity & Digital Forensics",
    publishedDate: "2026-04-12",
    readingTime: "5 min read",
    coverImageAlt: "Cybersecurity defense training session in progress",
    excerpt: "Specialized fellowship track delivering industry certifications, incident response labs, and SOC operational training.",
    body: [
      "Building robust cybersecurity capacity requires diverse teams equipped with real-world defensive engineering skills.",
      "In partnership with national institutions, the fellowship delivers hands-on SOC monitoring, penetration testing, and compliance frameworks.",
    ],
  },

  // NEWS
  {
    slug: "rwanda-inclusive-digital-public-infrastructure-50-in-5",
    category: "news",
    title: "Rwanda strengthens commitment to inclusive digital public infrastructure",
    publishedDate: "2026-06-03",
    readingTime: "3 min read",
    coverImageAlt: "SAN TECH team demonstrating the E-Visitors system",
    excerpt: "A closer look at the public infrastructure conversation and the role of practical, trusted digital systems in expanding access.",
    body: [
      "Rwanda continues to invest in digital public infrastructure that can make essential services more accessible, accountable, and useful to people and institutions.",
      "For SAN TECH, that direction reinforces the importance of building systems that work in the conditions where they are needed: clear for people, dependable for operators, and designed to improve over time.",
      "The 50-in-5 conversation is a reminder that inclusion is not only about launching technology. It is about making sure the technology can be adopted, supported, and trusted.",
    ],
  },
  {
    slug: "central-bank-of-rwanda-deploys-e-visitors",
    category: "news",
    title: "National Bank of Rwanda (BNR) Deploys Enterprise E-Visitors",
    publishedDate: "2026-05-19",
    readingTime: "4 min read",
    coverImageAlt: "Enterprise access management interface deployed at BNR",
    excerpt: "Securing national banking infrastructure with biometric identity verification, multi-gate authorization, and audit reporting.",
    body: [
      "The deployment of SAN TECH's E-Visitors system across BNR headquarters marks a critical milestone in institutional security and digital identity compliance.",
      "The system handles over 1,200 daily visitor transactions with automated audit trails and real-time security clearances.",
    ],
  },
  {
    slug: "san-tech-expands-west-africa-hub-bamako",
    category: "news",
    title: "SAN TECH Expands Regional Engineering Operations to Bamako, Mali",
    publishedDate: "2026-04-08",
    readingTime: "3 min read",
    coverImageAlt: "SAN TECH executive leadership meeting with West African partners",
    excerpt: "Scaling pan-African digital solutions across West Africa with localized support and technology integration teams.",
    body: [
      "SAN TECH's Bamako branch now provides direct implementation, training, and technical advisory services for regional government and private enterprise partners.",
    ],
  },

  // ANNOUNCEMENTS
  {
    slug: "san-tech-product-and-community-updates",
    category: "announcements",
    title: "SAN TECH product and community updates",
    publishedDate: "2026-05-28",
    readingTime: "2 min read",
    coverImageAlt: "E-Visitors operations and hardware presentation",
    excerpt: "New product milestones, ecosystem updates, and community opportunities from across SAN TECH and SAN HUB.",
    body: [
      "Tech Pulse is where SAN TECH shares the updates that help partners, clients, learners, and the wider ecosystem stay close to the work.",
      "This space will cover product releases, new partnerships, programme dates, team news, and the operational lessons behind the systems we build.",
      "The collection will grow as new stories are published and will eventually be managed through the SAN TECH content management system.",
    ],
  },
  {
    slug: "san-track-iot-fleet-management-launch",
    category: "announcements",
    title: "Release: SAN TRACK v2.4 with Predictive Fuel & Route AI",
    publishedDate: "2026-05-02",
    readingTime: "3 min read",
    coverImageAlt: "SAN TRACK fleet analytics dashboard",
    excerpt: "Major firmware and cloud platform update introducing real-time telemetry, geofencing, and driver behavior scoring.",
    body: [
      "SAN TRACK v2.4 brings advanced telematics and offline data caching for fleet operators navigating cross-border African transit corridors.",
    ],
  },

  // EVENT
  {
    slug: "african-innovation-digital-systems-summit-2026",
    category: "event",
    title: "African Innovation & Digital Systems Summit 2026",
    publishedDate: "2026-05-11",
    readingTime: "5 min read",
    coverImageAlt: "Technology and business leaders gathered at a Rwanda global business forum",
    excerpt: "The people, ideas, and conversations shaping a more useful and locally grounded technology ecosystem.",
    body: [
      "Events are an important part of the SAN TECH ecosystem because they create room for people building, funding, governing, and using technology to meet around shared questions.",
      "The summit programme brings together demonstrations, conversations, and practical connections across digital transformation, innovation, and institutional technology.",
      "More event details, registration links, and programme updates will be added here as they become available.",
    ],
  },
  {
    slug: "tech-forward-live-annual-product-keynote",
    category: "event",
    title: "Tech Forward Live 2026: The Future of Digital Infrastructure",
    publishedDate: "2026-04-20",
    readingTime: "4 min read",
    coverImageAlt: "CEO Keynote at Tech Forward Live 2026",
    excerpt: "Keynote highlights, product roadmap reveals, and ecosystem demonstrations presented to industry leaders and clients.",
    body: [
      "Over 400 attendees joined SAN TECH leadership at the annual Tech Forward Live summit to explore next-generation applications.",
    ],
  },

  // RECOGNITION
  {
    slug: "best-exhibitor-in-ict-and-innovation",
    category: "recognition",
    title: "SAN TECH recognized for ICT and innovation",
    publishedDate: "2026-09-19",
    readingTime: "3 min read",
    coverImageAlt: "Award trophy presentation at 29th Rwanda International Trade Fair",
    excerpt: "Recognition is a reflection of the teams, institutions, and partners who make practical technology possible.",
    body: [
      "SAN TECH was recognized as Best Exhibitor in ICT and Innovation at the 29th Rwanda International Trade Fair, Expo 2026.",
      "The recognition reflects the work behind products such as E-Visitors and the wider effort to connect people, ideas, and technology with measurable institutional impact.",
      "We share the recognition with the clients, partners, learners, and builders who continue to challenge us to make technology more useful.",
    ],
  },
  {
    slug: "ncsa-certified-data-controller-processor",
    category: "recognition",
    title: "Certified Data Controller & Processor by National Cyber Security Authority",
    publishedDate: "2026-08-10",
    readingTime: "3 min read",
    coverImageAlt: "Official Data Processor Certificate issued by DPPO / NCSA",
    excerpt: "Full statutory compliance with Law N° 058/2021 relating to the protection of personal data and privacy in Rwanda.",
    body: [
      "SAN TECH maintains strict adherence to data protection regulations, ensuring all client records and institutional data remain encrypted, audited, and sovereign.",
    ],
  },

  // TRENDS
  {
    slug: "technology-that-strengthens-sustainable-growth",
    category: "trends",
    title: "Technology that strengthens sustainable growth",
    publishedDate: "2026-04-30",
    readingTime: "6 min read",
    coverImageAlt: "A community workshop using digital tools in Rwanda",
    excerpt: "Signals and perspectives on technology that improves operations while creating room for people and communities to grow.",
    body: [
      "The most useful technology is not always the newest technology. It is technology that can be understood, supported, and connected to the real goals of the people using it.",
      "Across institutions, businesses, and communities, the next phase of digital transformation will be shaped by responsible adoption, local capability, and systems that keep delivering value after launch.",
      "Tech Pulse will track the ideas and patterns that can help teams make those decisions with more confidence.",
    ],
  },
  {
    slug: "digital-public-goods-and-open-architecture",
    category: "trends",
    title: "Why Modular Architecture Outperforms Monolithic Vendor Lock-In",
    publishedDate: "2026-03-18",
    readingTime: "4 min read",
    coverImageAlt: "Architecture diagram review session",
    excerpt: "Analyzing how interoperable APIs and open standards ensure sustainable sovereignty for emerging markets.",
    body: [
      "Public and private institutions increasingly reject closed proprietary platforms in favor of modular, API-first software architectures.",
    ],
  },

  // IMPACT
  {
    slug: "measuring-impact-beyond-the-launch",
    category: "impact",
    title: "Measuring contribution beyond the launch",
    publishedDate: "2026-04-14",
    readingTime: "5 min read",
    coverImageAlt: "Community technology deployment milestone",
    excerpt: "Why useful technology should be measured by the people reached, systems strengthened, and capability left behind.",
    body: [
      "A product launch is a beginning, not the final measure of success. Impact grows through adoption, support, learning, and the outcomes people can see in their daily work.",
      "SAN TECH looks at contribution through the institutions served, people reached, opportunities created, and capabilities that remain after delivery teams move on.",
      "This journal will make those lessons easier to find, discuss, and carry into the next generation of products and programmes.",
    ],
  },
  {
    slug: "digital-skills-empowerment-47-institutions",
    category: "impact",
    title: "2,550+ Beneficiaries Across 47+ Partner Institutions",
    publishedDate: "2026-02-28",
    readingTime: "4 min read",
    coverImageAlt: "Graduation celebration for tech beneficiaries",
    excerpt: "Field metrics tracking software adoption, operational time savings, and workforce digital competency across Rwanda.",
    body: [
      "Through SAN HUB Academy and direct enterprise onboarding, SAN TECH measures genuine impact through retained capability and operational resilience.",
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert string[] body paragraphs → Strapi blocks format */
function bodyToBlocks(paragraphs) {
  return paragraphs.map((text) => ({
    type: "paragraph",
    children: [{ type: "text", text }],
  }));
}

async function strapiGet(path) {
  const res = await fetch(`${STRAPI_URL}${path}`, {
    headers: { Authorization: `Bearer ${API_TOKEN}` },
  });
  if (!res.ok) throw new Error(`GET ${path} → ${res.status} ${res.statusText}`);
  return res.json();
}

async function strapiPost(path, body) {
  const res = await fetch(`${STRAPI_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_TOKEN}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST ${path} → ${res.status}: ${text}`);
  }
  return res.json();
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🚀  Seeding Tech Pulse articles → ${STRAPI_URL}\n`);

  // Fetch existing slugs so we can skip duplicates
  let existingSlugs = new Set();
  try {
    const existing = await strapiGet(
      "/api/tech-pulse-articles?fields[0]=slug&pagination[pageSize]=500&status=draft"
    );
    existingSlugs = new Set((existing.data ?? []).map((d) => d.slug));
    console.log(`   Found ${existingSlugs.size} existing article(s) in Strapi.\n`);
  } catch (err) {
    console.error("   Could not fetch existing articles — is Strapi running?\n  ", err.message);
    process.exit(1);
  }

  let created = 0;
  let skipped = 0;

  for (const article of techPulseArticles) {
    if (existingSlugs.has(article.slug)) {
      console.log(`   ⏭   Skipping (already exists): ${article.slug}`);
      skipped++;
      continue;
    }

    try {
      await strapiPost("/api/tech-pulse-articles", {
        data: {
          title:         article.title,
          slug:          article.slug,
          category:      article.category,
          excerpt:       article.excerpt,
          body:          bodyToBlocks(article.body),
          coverImageAlt: article.coverImageAlt,
          readingTime:   article.readingTime,
          publishedDate: article.publishedDate,
          // Publish immediately so the articles appear on the frontend.
          // Remove this line if you want them to start as drafts.
          publishedAt:   new Date().toISOString(),
        },
      });
      console.log(`   ✅  Created: ${article.slug}`);
      created++;
    } catch (err) {
      console.error(`   ❌  Failed:  ${article.slug} — ${err.message}`);
    }
  }

  console.log(`\n✨  Done — ${created} created, ${skipped} skipped.\n`);

  if (created > 0) {
    console.log(
      "   👉  Cover images were NOT uploaded automatically.\n" +
      "   Open the Strapi admin, find each article, and upload its cover image from\n" +
      "   santech-f/public/images/ — the path is in tech-pulse-data.ts.\n"
    );
  }
}

main().catch((err) => {
  console.error("\n💥  Unexpected error:", err);
  process.exit(1);
});
