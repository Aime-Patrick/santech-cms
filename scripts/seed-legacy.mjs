/** Seed the editable single-type content used by Our Legacy. */

const STRAPI_URL = (process.env.STRAPI_URL ?? "http://localhost:1337").replace(/\/$/, "");
const API_TOKEN = process.env.STRAPI_API_TOKEN ?? "";

if (!API_TOKEN) {
  console.error("STRAPI_API_TOKEN is not set.");
  process.exit(1);
}

const headers = { "Content-Type": "application/json", Authorization: `Bearer ${API_TOKEN}` };
const content = {
  whoWeAreBody: "SAN TECH is a technological company focused on digital transformation and innovation. We develop smart digital products and integrated technology solutions while building the human talent and innovation ecosystem needed to create and deploy them.",
  whoWeAreSecondaryBody: "SAN TECH connects people, ideas and technology — helping organizations solve real problems while helping the next generation develop the skills and products needed to create new innovative solutions.",
  identityFacts: [
    { label: "Founded", value: "1 August 2019" },
    { label: "Founder & CEO", value: "Mr. Shema Pacifique" },
    { label: "Co-founder & COO/CFO", value: "Claudine Niyonzima" },
    { label: "Head office", value: "Kigali, Rwanda" },
    { label: "Core philosophy", value: "Turning Ideas into Impact" },
    { label: "Stamp motto", value: "Innovate · Empower · Deliver" },
  ],
  missionTitle: "Mission",
  missionTagline: "Build useful capability",
  missionDescription: "To create and deliver innovative, secure, affordable, and sustainable technology solutions while developing the people and ecosystems that make innovation happen.",
  visionTitle: "Vision",
  visionTagline: "Widen what is possible",
  visionDescription: "To be a leading African technology and innovation hub transforming ideas into smart solutions that improve lives and drive economic growth.",
  profileTitle: "Turning Ideas into Impact.",
  profileDescription: "SAN TECH stands for Smart Applications and Networking Technology. Founded in Rwanda in 2019, with a branch in Bamako, Mali, we develop practical digital solutions, technology products, and technical capacity for organizations, businesses, institutions, and communities.",
  profileFacts: [
    { label: "Established", value: "2019 · Rwanda" },
    { label: "Footprint", value: "Kigali · Bamako" },
    { label: "Impact", value: "47+ institutions · 2,550+ beneficiaries" },
    { label: "Compliance", value: "Certified Data Controller & Processor" },
  ],
  impactStats: [
    { value: "47+", label: "Institutions", description: "Across public and private environments" },
    { value: "2,550+", label: "Beneficiaries", description: "People reached through SAN TECH programs" },
    { value: "17+", label: "Countries reached", description: "Across products, learning, and partnerships" },
  ],
  publishedAt: new Date().toISOString(),
};

const response = await fetch(`${STRAPI_URL}/api/legacy-page`, {
  method: "PUT",
  headers,
  body: JSON.stringify({ data: content }),
});

if (!response.ok) {
  console.error(`Failed to seed legacy page: ${response.status} ${await response.text()}`);
  process.exit(1);
}

console.log("Our Legacy content seeded successfully.");
