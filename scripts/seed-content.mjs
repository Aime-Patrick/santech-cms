/**
 * seed-content.mjs
 *
 * Seeds the remaining content collections into Strapi:
 * - E-Visitors features, milestones, FAQs
 * - Journey stages, company values, focus areas
 * - Home story slides
 * - Innovation products, services, solutions
 * - Technology categories
 *
 * Prerequisites:
 *   1. Strapi running  (`npm run dev` in cms/)
 *   2. Full-access API token from admin → Settings → API Tokens
 *
 * Usage (PowerShell):
 *   $env:STRAPI_API_TOKEN="<token>"; node scripts/seed-content.mjs
 *
 * Idempotent — existing records are skipped.
 */

const STRAPI_URL = (process.env.STRAPI_URL ?? "http://localhost:1337").replace(/\/$/, "");
const API_TOKEN  = process.env.STRAPI_API_TOKEN ?? "";

if (!API_TOKEN) {
  console.error("\n❌  STRAPI_API_TOKEN is not set.\n"); process.exit(1);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function get(path) {
  const res = await fetch(`${STRAPI_URL}${path}`, { headers: { Authorization: `Bearer ${API_TOKEN}` } });
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
  return res.json();
}

async function post(path, body) {
  const res = await fetch(`${STRAPI_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_TOKEN}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) { const t = await res.text(); throw new Error(`POST ${path} → ${res.status}: ${t}`); }
  return res.json();
}

async function existingField(endpoint, field) {
  try {
    const json = await get(`/api/${endpoint}?fields[0]=${field}&pagination[pageSize]=500&status=draft`);
    return new Set((json.data ?? []).map((d) => d[field] ?? d.attributes?.[field]));
  } catch { return new Set(); }
}

function publish() { return new Date().toISOString(); }
function log(e, m) { console.log(`   ${e}  ${m}`); }

async function seed(name, endpoint, records, keyField, buildData) {
  console.log(`\n${name}`);
  const existing = await existingField(endpoint, keyField);
  let created = 0, skipped = 0;
  for (const record of records) {
    const key = record[keyField];
    if (existing.has(key)) { log("⏭", `Skip: ${key}`); skipped++; continue; }
    try {
      await post(`/api/${endpoint}`, { data: { ...buildData(record), publishedAt: publish() } });
      log("✅", `Created: ${key}`);
      created++;
    } catch (e) { log("❌", `Failed: ${key} — ${e.message}`); }
  }
  console.log(`   → ${created} created, ${skipped} skipped`);
}

// ═══════════════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════════════

const E_VISITORS_FEATURES = [
  { number: "01", label: "Gate Movement Management", title: "Track every arrival and departure.", description: "Monitor gate activity, entries, exits, and exceptions with one dependable operational record.", panel: "Gate movement", status: "Live movement view", iconName: "BarChart3", details: ["Gate entries: 02", "Current visitors: 38", "Status: Live"], sortOrder: 1 },
  { number: "02", label: "Appointment & VIP Management", title: "Prepare every important visit.", description: "Coordinate appointments, hosts, VIP guests, schedules, and visit purposes before arrival.", panel: "Appointments and VIPs", status: "Appointment ready", iconName: "Users", details: ["Host: Executive office", "Visit type: VIP", "Status: Scheduled"], sortOrder: 2 },
  { number: "03", label: "Access Control", title: "Give the right people the right access.", description: "Route approvals, issue passes, and apply clear access rules for every person and location.", panel: "Access control", status: "Approved by host", iconName: "ShieldCheck", details: ["Access zone: Main office", "Pass type: Visitor", "Valid until: 17:30"], sortOrder: 3 },
  { number: "04", label: "Emergency & Safety Management", title: "Respond with a clearer view of people on site.", description: "Keep presence, safety checks, alerts, and exceptions visible when teams need to act quickly.", panel: "Emergency and safety", status: "Safety view active", iconName: "ScanLine", details: ["Identity: Verified", "Watchlist: Clear", "Risk check: Complete"], sortOrder: 4 },
  { number: "05", label: "Multi-Organization / Multi-Site Management", title: "Manage more than one environment.", description: "Connect organizations, branches, departments, and sites while keeping local teams and rules visible.", panel: "Multi-site operations", status: "Sites connected", iconName: "Building2", details: ["Organizations: 04", "Sites: 12", "Report: Consolidated"], sortOrder: 5 },
  { number: "06", label: "Events & Meeting Management", title: "Make gatherings easier to coordinate.", description: "Plan event access, meeting attendance, guest lists, hosts, and venue entry from one place.", panel: "Events and meetings", status: "Event ready", iconName: "CalendarDays", details: ["Event: Partner meeting", "Guests: 24", "Venue: Main hall"], sortOrder: 6 },
  { number: "07", label: "Equipment & Vehicle Tracking Management", title: "Keep assets and movement accountable.", description: "Track equipment, vehicles, drivers, access times, and movement history across your sites.", panel: "Equipment and vehicles", status: "Tracking active", iconName: "Truck", details: ["Vehicles on site: 12", "Equipment records: 47", "Tracking: Active"], sortOrder: 7 },
];

const PRODUCT_MILESTONES = [
  { year: "2019", title: "Inception", description: "E-Visitors prototype and IP journey begins; the product is recognized through NIRDA Innovate for Industry.", product: "e-visitors", sortOrder: 1 },
  { year: "2021", title: "Resilience", description: "Technology supports institutional digital processes and resilience during the COVID-19 recovery period.", product: "e-visitors", sortOrder: 2 },
  { year: "2023", title: "Institutional adoption", description: "E-Visitors reaches a major market-validation milestone through adoption by the National Bank of Rwanda.", product: "e-visitors", sortOrder: 3 },
];

const FAQ_ITEMS = [
  { question: "What is E-Visitors?", answer: "E-Visitors is a visitor, access, and attendance management platform that helps institutions register guests, verify identities, approve access, monitor movement, and keep accountable records.", product: "e-visitors", sortOrder: 1 },
  { question: "Who is E-Visitors designed for?", answer: "It supports corporate offices, government institutions, hospitals, schools, universities, and other environments that need a clearer and safer way to manage people entering their premises.", product: "e-visitors", sortOrder: 2 },
  { question: "What can the platform manage?", answer: "Teams can manage visitor registration, appointments, ID or passport checks, approvals, QR or barcode passes, watchlists, vehicles, live presence, reports, and audit trails.", product: "e-visitors", sortOrder: 3 },
  { question: "Can E-Visitors fit our existing workflow?", answer: "Yes. The platform is designed around the way reception, security, hosts, and operations teams already work, with configurable access rules and a rollout that can grow with your institution.", product: "e-visitors", sortOrder: 4 },
  { question: "How can we request a demonstration?", answer: "Use the Request a demo button to book a conversation with SAN TECH. We can review your visitor, access, attendance, and institutional security requirements together.", product: "e-visitors", sortOrder: 5 },
];

const JOURNEY_STAGES = [
  { year: "2018", stage: "Idea", description: "Founders identify problems with manual visitor management.", sortOrder: 1 },
  { year: "2019", stage: "Inception", description: "SAN TECH founded; E-Visitors prototype and IP journey begins.", sortOrder: 2 },
  { year: "2019", stage: "Validation", description: "E-Visitors recognized through NIRDA Innovate for Industry.", sortOrder: 3 },
  { year: "2020", stage: "Testing", description: "Prototype moves toward real users and institutional applications.", sortOrder: 4 },
  { year: "2021", stage: "Institutionalization", description: "Technology supports institutional resilience and digital processes.", sortOrder: 5 },
  { year: "2022", stage: "Ecosystem", description: "Recognition and emergence of SAN HUB.", sortOrder: 6 },
  { year: "2023", stage: "Market Validation", description: "SAN HUB officially launched; E-Visitors adopted by National Bank of Rwanda (BNR).", sortOrder: 7 },
  { year: "2024", stage: "Partnerships", description: "International partnerships and innovators from multiple countries.", sortOrder: 8 },
  { year: "2025", stage: "Scaling", description: "SAN HUB expands; international and continental ambitions grow.", sortOrder: 9 },
  { year: "2026", stage: "African Tech Vision", description: "SAN TECH expands its technology, training, innovation, and systems-integration ecosystem.", sortOrder: 10 },
];

const COMPANY_VALUES = [
  { label: "Innovation", description: "We transform ideas, challenges, and opportunities into practical technological solutions.", sortOrder: 1 },
  { label: "Excellence", description: "We pursue high standards in technology, service delivery, engineering, and customer experience.", sortOrder: 2 },
  { label: "Integrity & Ownership", description: "We act with honesty, take responsibility for our work, and follow through on commitments to our people, clients, and communities.", sortOrder: 3 },
  { label: "Customer Centricity", description: "We understand our clients and end users and design solutions around their real needs.", sortOrder: 4 },
  { label: "Impact", description: "We measure success by the positive economic, institutional, social, and technological results our work creates.", sortOrder: 5 },
  { label: "Collaboration", description: "We work with clients, government, academia, innovators, communities, and technology partners to achieve shared objectives.", sortOrder: 6 },
  { label: "Continuous Learning", description: "We continuously develop our people, adopt emerging technologies, conduct research, and improve our solutions.", sortOrder: 7 },
  { label: "Security & Responsibility", description: "We build technology with cybersecurity, privacy, reliability, safety, and responsible technology use at its foundation.", sortOrder: 8 },
  { label: "Empowerment", description: "Through SAN HUB and other initiatives, we equip young people, professionals, entrepreneurs, and organizations with knowledge and opportunities to create value.", sortOrder: 9 },
];

const FOCUS_AREAS = [
  { label: "Software Engineering", description: "Builds customized digital systems, enterprise platforms, and secure web & mobile applications.", iconName: "Code2", sortOrder: 1 },
  { label: "Artificial Intelligence", description: "Develops intelligent automation, machine learning models, and predictive data solutions.", iconName: "BrainCircuit", sortOrder: 2 },
  { label: "Cybersecurity", description: "Protects institutional infrastructure, networks, systems, and compliance data.", iconName: "ShieldCheck", sortOrder: 3 },
  { label: "IoT & Connected Devices", description: "Connects smart physical sensors, telemetry hardware, and central software.", iconName: "Radio", sortOrder: 4 },
  { label: "Embedded Technology", description: "Engineers hardware/software integrated microcontroller solutions and firmware.", iconName: "Cpu", sortOrder: 5 },
  { label: "Digital Transformation", description: "Converts manual operations into streamlined, automated digital workflows.", iconName: "Workflow", sortOrder: 6 },
  { label: "Systems Integration", description: "Connects diverse technologies, APIs, and institutional organizational systems.", iconName: "Network", sortOrder: 7 },
  { label: "Innovation & Incubation", description: "Converts ideas and prototypes into tested, usable, market-ready products.", iconName: "Lightbulb", sortOrder: 8 },
  { label: "Training & Capacity", description: "Develops practical, job-ready technology and engineering skills through SAN HUB.", iconName: "GraduationCap", sortOrder: 9 },
  { label: "Research & Development", description: "Experiments with emerging technologies, prototype testing, and applied science.", iconName: "FlaskConical", sortOrder: 10 },
  { label: "Technology Consultancy", description: "Provides technical advisory, digital architecture, and transformation guidance.", iconName: "Compass", sortOrder: 11 },
  { label: "Product Deployment", description: "Installs, integrates, trains users, and supports long-term operational systems.", iconName: "Rocket", sortOrder: 12 },
];

const HOME_STORY_SLIDES = [
  { slideId: "about", index: "01", eyebrow: "SAN TECH / ABOUT SAN TECH", title: "Making your ideas happen with us!", body: "SAN TECH is technological and digital transformation company that develops smart systems, AI, IoT, cybersecurity, embedded and digital solutions while building technology skills and innovation development through SAN HUB.", detail: "SAN TECH helps institutions, organizations and innovators to move from an idea or problem → design → development → deployment → impact.", additional: "SAN TECH works closer with organizations, businesses, institutions, innovators, researchers, and communities to design, develop, deploy, integrate, and support technology solutions from scratch.", facts: [{ label: "Established", value: "2019" }, { label: "Focus", value: "Digital transformation" }, { label: "Promise", value: "Practical impact" }], sortOrder: 1 },
  { slideId: "services", index: "02", eyebrow: "SAN TECH / SERVICES", variant: "services", body: "SAN TECH provides end-to-end technology services focused on digital transformation, software engineering, artificial intelligence, cybersecurity, IoT, infrastructure, innovation, and capacity building.", detail: "SAN TECH Service Model", additional: "SAN TECH — Turning Ideas into Impact.", note: "We bring strategy, engineering, and capacity building together so solutions can keep working after launch.", flow: ["Ideate", "Design", "Develop", "Integrate", "Deploy", "Train", "Support", "Scale"], facts: [], sortOrder: 2 },
  { slideId: "approach", index: "03", eyebrow: "SAN TECH / APPROACH", title: "Our Approach", body: "We believe technology should move beyond ideas and become usable, scalable, sustainable solutions.", detail: "Our approach follows:", flow: ["Ideate", "Design", "Develop", "Test", "Deploy", "Integrate", "Train", "Scale", "Impact"], additional: "We work closely with clients and partners to understand their challenges, design appropriate solutions, develop and test the technology, deploy it within their operational environment, train users, and provide continuous technical support.", note: "Each stage gives the next one a stronger foundation: evidence improves design, testing improves trust, and training improves adoption.", facts: [], sortOrder: 3 },
  { slideId: "ecosystem", index: "04", eyebrow: "SAN TECH / ECOSYSTEM", body: "SAN TECH develops an ecosystem that connects ideas, technology, talent, research, investment, institutions, businesses, and end users.", detail: "Our ecosystem includes:", note: "The ecosystem works as a connected network: learning develops talent, research informs solutions, partners open opportunities, and deployed products create evidence for the next idea.", items: ["SAN TECH — technology solutions and digital transformation", "SAN HUB — learning, innovation, research, entrepreneurship, and talent development", "E-VISITORS — visitor and access-management technology", "Tech Forward Live — technology and innovation events", "SAN CITY — a long-term vision for an integrated technology, innovation, research, demonstration, and commercialization ecosystem", "Custom Enterprise Platforms — systems designed around the operational requirements of institutions and businesses."], facts: [], sortOrder: 4 },
  { slideId: "value-proposition", index: "05", eyebrow: "SAN TECH / VALUE PROPOSITION", body: "SAN TECH transforms ideas, operational challenges and research concepts into practical technology products and scalable digital solutions.", detail: "SAN TECH combines engineering + innovation + training + implementation + ecosystem development so that technology can move from an idea to a deployed and measurable solution.", note: "This combination helps us respond to immediate operational needs while also supporting longer-term transformation goals.", groups: [{ label: "Engineering", items: "Software, platforms, integrations" }, { label: "Innovation", items: "Research, prototypes, new possibilities" }, { label: "Capability", items: "Training, implementation, adoption" }], facts: [{ label: "Core positioning", value: "Turning Ideas into Impact" }, { label: "Motto", value: "Innovate • Empower • Deliver" }], sortOrder: 5 },
  { slideId: "long-term-direction", index: "06", eyebrow: "SAN TECH / LONG-TERM DIRECTION", title: "Build the African technology ecosystem.", body: "Our broader ambition is to connect inventors, researchers, developers, industry, government, investors, decision makers, and end users.", detail: "The objective is more Local Innovation, stronger digital capabilities, and more Work & Enterprise opportunities with less dependence on imported solutions.", note: "We are building toward an ecosystem where African talent and institutions can create, own, and scale technology that responds to local realities.", flow: ["Inventors", "Researchers", "Developers", "Industry", "Government", "Investors", "Decision makers", "End users"], facts: [{ label: "Direction", value: "Local Innovation" }, { label: "Opportunity", value: "Work & Enterprise" }, { label: "Result", value: "Digital Capability" }], sortOrder: 6 },
  { slideId: "development-mode", index: "07", eyebrow: "SAN TECH / DEVELOPMENT MODEL", title: "Work across the complete technology lifecycle.", body: "Our implementation cycle carries each solution from an early idea through research, delivery, adoption, and measurable impact.", detail: "This allows SAN TECH to work across the complete technology lifecycle rather than only supplying software or hardware.", note: "Staying involved across the lifecycle keeps teams close to the work after launch, using feedback and evidence to improve what already exists.", flow: ["Ideate", "Research", "Design", "Develop", "Test", "Pilot", "Implement", "Train", "Scale", "Measure impact"], facts: [{ label: "Method", value: "Lifecycle delivery" }, { label: "Measure", value: "Adoption and results" }, { label: "Scale", value: "Secure and sustainable" }], sortOrder: 7 },
  { slideId: "stakeholders", index: "08", eyebrow: "SAN TECH / STAKEHOLDERS", title: "Technology grows through shared ownership.", body: "We work with the institutions, organizations, and people who shape the environments where technology must create value.", detail: "Our stakeholders bring context, expertise, resources, questions, and lived experience that make solutions more useful and ready for adoption.", note: "We listen to each stakeholder group early so the final solution reflects real constraints, responsibilities, and opportunities.", items: ["Government institutions", "Banks and financial institutions", "Corporates and SMEs", "Hospitals", "Schools and universities", "NGOs and development organizations", "Industrial companies", "Property and estate managers", "Entrepreneurs and startups", "Researchers and innovators", "Youth and technology learners", "Communities and end users"], facts: [], sortOrder: 8 },
];

const INNOVATION_PRODUCTS = [
  { productId: "e-visitors", label: "E-VISITORS", title: "Make every arrival better", description: "", coreFeatures: [{ label: "Gate Movement Management", description: "", iconName: "BarChart3" }, { label: "Appointment & VIP Management", description: "", iconName: "Users" }, { label: "Access Control", description: "", iconName: "ShieldCheck" }, { label: "Emergency & Safety Management", description: "", iconName: "ScanLine" }, { label: "Multi-Organization / Multi-Site Management", description: "", iconName: "Building2" }, { label: "Events & Meeting Management", description: "", iconName: "CalendarDays" }, { label: "Equipment & Vehicle Tracking Management", description: "", iconName: "Truck" }], mediaKind: "image", mediaAlt: "E-Visitors visitor management screen", sortOrder: 1 },
  { productId: "san-track", label: "SAN TRACK", title: "See operations as they move.", description: "Track assets, fleets, and field operations with clearer visibility and better decisions.", coreFeatures: [{ label: "Asset tracking", description: "Register important assets and follow their status, location, and history over time.", iconName: "Radar" }, { label: "Fleet visibility", description: "See where vehicles are, how they are being used, and when action is needed.", iconName: "Network" }, { label: "Location intelligence", description: "Turn location data into a clearer view of field activity and operational patterns.", iconName: "Globe2" }, { label: "Operations dashboards", description: "Bring live operational signals into one view for faster, better-informed decisions.", iconName: "Workflow" }], mediaKind: "image", mediaAlt: "SAN TRACK operations and asset tracking view", sortOrder: 2 },
  { productId: "san-book", label: "SAN BOOK", title: "Make knowledge easier to use.", description: "Bring digital libraries, records, and institutional knowledge into one useful system.", coreFeatures: [{ label: "Digital records", description: "Store important documents and records in a structured place that is easier to maintain.", iconName: "FileText" }, { label: "Searchable knowledge", description: "Find the right information quickly with organized content and useful search.", iconName: "Database" }, { label: "Secure access", description: "Give the right people access to the right knowledge while protecting sensitive records.", iconName: "LockKeyhole" }, { label: "Institutional workflows", description: "Move requests, reviews, and approvals through clear digital steps.", iconName: "Workflow" }], mediaKind: "image", mediaAlt: "SAN TECH team working with knowledge systems", sortOrder: 3 },
  { productId: "revixsan", label: "REVIXSAN", title: "Turn review into improvement.", description: "Support quality assurance, audit reviews, and operational compliance with practical evidence.", coreFeatures: [{ label: "Quality reviews", description: "Review work against clear standards and identify where quality can improve.", iconName: "ShieldCheck" }, { label: "Compliance checks", description: "Check required controls and make gaps visible before they become bigger problems.", iconName: "ScanLine" }, { label: "Action tracking", description: "Assign follow-up actions, monitor progress, and keep improvement work accountable.", iconName: "Workflow" }, { label: "Evidence reporting", description: "Collect the evidence behind decisions, reviews, and compliance outcomes.", iconName: "FileText" }], mediaKind: "image", mediaAlt: "SAN TECH recognition and trust", sortOrder: 4 },
  { productId: "sanverse", label: "SANVERSE", title: "Build spaces for what comes next.", description: "Explore immersive digital platforms and spatial experiences for learning, collaboration, and impact.", coreFeatures: [{ label: "Immersive environments", description: "Create digital spaces that help people learn, explore, and collaborate in new ways.", iconName: "Boxes" }, { label: "Interactive experiences", description: "Make information and participation more engaging through responsive digital experiences.", iconName: "Cpu" }, { label: "Virtual collaboration", description: "Bring people together around shared work, ideas, and activities from different places.", iconName: "Network" }, { label: "Digital storytelling", description: "Use connected media and interaction to make important ideas easier to understand and remember.", iconName: "Globe2" }], mediaKind: "image", mediaAlt: "SAN TECH innovation experience", sortOrder: 5 },
];

const INNOVATION_SERVICES = [
  { serviceId: "software-and-digital-products", label: "Software & Digital Products", description: "Web, mobile, enterprise software, APIs, and databases.", iconName: "Code2", sortOrder: 1 },
  { serviceId: "ai-data-and-automation", label: "AI, Data & Automation", description: "AI, machine learning, OCR, computer vision, and analytics.", iconName: "BrainCircuit", sortOrder: 2 },
  { serviceId: "iot-embedded-and-robotics", label: "IoT, Embedded & Robotics", description: "IoT, sensors, embedded systems, and robotics.", iconName: "Cpu", sortOrder: 3 },
  { serviceId: "cybersecurity-and-infrastructure", label: "Cybersecurity & Infrastructure", description: "Cybersecurity, networks, servers, cloud, and data centers.", iconName: "LockKeyhole", sortOrder: 4 },
  { serviceId: "smart-systems", label: "Smart Systems", description: "E-Visitors, access control, tracking, and monitoring.", iconName: "Radar", sortOrder: 5 },
  { serviceId: "digital-transformation", label: "Digital Transformation", description: "Automation, integration, consultancy, modernization, business-process digitization, paperless workflows, and enterprise modernization.", iconName: "Workflow", sortOrder: 6 },
  { serviceId: "business-digital-intelligence-bdi", label: "Business Digital Intelligence (BDI)", description: "ERP, management information systems, CRM, inventory, finance, payroll, visitor management, document management, workflow automation, asset management, procurement, attendance, reporting, and analytics.", iconName: "Database", sortOrder: 7 },
  { serviceId: "innovation-and-r-and-d", label: "Innovation & R&D", description: "Prototyping, research, product development, testing, and scale.", iconName: "Boxes", sortOrder: 8 },
  { serviceId: "technology-consultancy", label: "Technology Consultancy", description: "IT strategy, business analysis, system requirements, technology architecture, digital transformation consulting, ICT project management, technical feasibility studies, technology procurement advisory, system audits, and IT policy and documentation.", iconName: "Globe2", sortOrder: 9 },
];

const INNOVATION_SOLUTIONS = [
  { solutionId: "software-engineering", label: "Software Engineering", description: "Design and build dependable digital products for everyday work, institutional operations, and growing organizations.", subItems: ["Web applications", "Mobile applications", "Desktop applications", "Enterprise systems", "API development & integration", "ERP, HRMIS and workflow systems", "Database systems"], iconName: "Globe2", sortOrder: 1 },
  { solutionId: "artificial-intelligence-and-machine-learning", label: "Artificial Intelligence & Machine Learning", description: "Apply intelligent systems to understand information, automate work, and support better decisions.", subItems: ["Computer vision", "OCR and document recognition", "AI assistants and chatbots", "Predictive analytics", "Recommendation systems", "Intelligent automation", "AI-powered decision-support systems"], iconName: "BrainCircuit", sortOrder: 2 },
  { solutionId: "e-visitors-and-access-management", label: "E-Visitors & Access Management", description: "Create safer, more visible visitor and access experiences for institutions, facilities, and events.", subItems: ["Visitor registration", "Appointment management", "VIP management", "Gate-pass management", "QR/barcode access", "ID/passport OCR", "Watchlist/blacklist management", "Vehicle and driver tracking", "Visitor analytics and reports"], iconName: "ScanLine", sortOrder: 3 },
  { solutionId: "iot-and-embedded-systems", label: "IoT & Embedded Systems", description: "Connect devices, environments, and operational data to systems that can monitor and guide action.", subItems: ["IoT monitoring", "Smart sensors", "RFID/NFC", "GPS tracking", "Embedded systems", "Smart access control", "Industrial monitoring", "Automation and control systems"], iconName: "Cpu", sortOrder: 4 },
  { solutionId: "cybersecurity", label: "Cybersecurity", description: "Protect systems, data, identities, and organizations through security built into technology and operations.", subItems: ["Security assessments", "Vulnerability assessment", "Network security", "Identity and access management", "Security monitoring", "Data protection", "Secure application development", "Cybersecurity awareness and training"], iconName: "ShieldCheck", sortOrder: 5 },
  { solutionId: "digital-transformation", label: "Digital Transformation", description: "Help organizations move from manual processes to connected, paperless, and modern digital operations.", subItems: ["Business-process digitization", "Paperless workflows", "Digital records", "Automation", "System integration", "Digital platforms", "Enterprise modernization"], iconName: "Workflow", sortOrder: 6 },
  { solutionId: "networking-and-it-infrastructure", label: "Networking & IT Infrastructure", description: "Build and maintain the reliable network and infrastructure foundations that technology depends on.", subItems: ["LAN/WAN", "Wi-Fi infrastructure", "Servers", "Data-center solutions", "CCTV and surveillance infrastructure", "Structured cabling", "Network monitoring", "IT infrastructure maintenance"], iconName: "Network", sortOrder: 7 },
  { solutionId: "cloud-and-devops", label: "Cloud & DevOps", description: "Deploy, operate, and improve applications and infrastructure with repeatable cloud and delivery practices.", subItems: ["Cloud deployment", "Application hosting", "CI/CD", "Containerization", "System monitoring", "Backup and disaster recovery", "Infrastructure automation"], iconName: "Database", sortOrder: 8 },
  { solutionId: "data-and-analytics", label: "Data & Analytics", description: "Turn operational information into clear reporting, useful intelligence, and better decisions.", subItems: ["Database architecture", "Business intelligence", "Dashboards", "Data visualization", "Reporting systems", "Data integration", "Operational analytics"], iconName: "Workflow", sortOrder: 9 },
  { solutionId: "innovation-and-r-and-d", label: "Innovation & R&D", description: "Move promising ideas from research and prototypes toward tested, useful, and scalable products.", subItems: ["Prototype development", "Proof-of-concept development", "Research systems", "Product engineering", "Technology testing", "Innovation challenges", "Commercialization support"], iconName: "Boxes", sortOrder: 10 },
  { solutionId: "san-hub", label: "SAN HUB", description: "Develop the technology talent and innovation capacity needed to create products, careers, and opportunity.", subItems: ["Technology training", "Digital skills development", "Internships", "Mentorship", "Innovation programs", "Startup development", "Research and product development"], iconName: "GraduationCap", sortOrder: 11 },
  { solutionId: "industry-solutions", label: "Industry Solutions", description: "Adapt technology to the operating realities of sectors that serve people, communities, and the economy.", subItems: ["Banking & financial services", "Government", "Education", "Healthcare", "Manufacturing", "Hospitality", "Logistics", "Real estate", "Retail", "NGOs and development organizations"], iconName: "Globe2", sortOrder: 12 },
];

const TECHNOLOGY_CATEGORIES = [
  { categoryId: "programming-languages", label: "Programming Languages", description: "Languages SAN TECH uses across software engineering, AI, IoT, and embedded systems.", iconName: "Code2", items: ["Python", "JavaScript", "TypeScript", "Java", "C", "C++", "C#", "Kotlin", "Swift", "Dart", "PHP", "Go", "Rust", "Scala", "Ruby", "R", "Julia", "Lua", "Perl", "Haskell", "Elixir", "Erlang", "Clojure", "Common Lisp", "OCaml", "Elm", "Ada", "Fortran", "F#", "Crystal", "D", "Nim", "Zig", "Solidity", "Haxe", "WebAssembly", "SQL", "HTML5", "CSS3", "Bash / Shell", "PowerShell", "Sass"], sortOrder: 1 },
  { categoryId: "web-and-application-development", label: "Web & Application Development", description: "Frameworks and platforms for building web, enterprise, and API systems.", iconName: "Globe2", items: ["React.js", "Next.js", "Angular", "Vue.js", "Node.js", "Express.js", "Laravel", "Django", "FastAPI", "Spring Boot", ".NET / ASP.NET", "REST APIs", "GraphQL", "Progressive Web Apps (PWA)"], sortOrder: 2 },
  { categoryId: "mobile-development", label: "Mobile Development", description: "Cross-platform and native mobile development frameworks.", iconName: "Smartphone", items: ["Flutter", "Android / Kotlin", "React Native", "Swift", "Firebase", "Progressive Web Apps (PWA)"], sortOrder: 3 },
  { categoryId: "ai-and-machine-learning", label: "AI & Machine Learning", description: "Libraries and frameworks for AI, data science, and machine learning.", iconName: "BrainCircuit", items: ["Python AI/ML ecosystem", "TensorFlow", "PyTorch", "Scikit-learn", "OpenCV", "Pandas", "NumPy", "Hugging Face", "LangChain", "Computer Vision APIs", "NLP tools", "Edge AI", "AutoML"], sortOrder: 4 },
  { categoryId: "ocr-and-computer-vision", label: "OCR & Computer Vision", description: "Optical character recognition and image processing tools.", iconName: "ScanLine", items: ["OpenCV", "Tesseract OCR", "Google Vision API", "AWS Rekognition", "Azure Computer Vision", "YOLO", "EasyOCR", "PaddleOCR"], sortOrder: 5 },
  { categoryId: "databases", label: "Databases", description: "Relational and non-relational database systems.", iconName: "Database", items: ["MySQL", "PostgreSQL", "Microsoft SQL Server", "SQLite", "MongoDB", "Redis", "Firebase Realtime DB", "Supabase", "PlanetScale", "DynamoDB"], sortOrder: 6 },
  { categoryId: "iot-and-embedded", label: "IoT & Embedded", description: "Hardware platforms and communication protocols for connected devices.", iconName: "Cpu", items: ["Arduino", "ESP32", "ESP8266", "Raspberry Pi", "STM32", "NFC", "MQTT", "RFID", "LoRa", "Zigbee", "BLE", "I2C / SPI / UART", "FreeRTOS", "Zephyr RTOS", "MicroPython"], sortOrder: 7 },
  { categoryId: "cybersecurity", label: "Cybersecurity", description: "Security tools, protocols, and frameworks for system protection.", iconName: "ShieldCheck", items: ["Kali Linux", "Metasploit", "Wireshark", "Nmap", "Burp Suite", "OWASP ZAP", "Snort", "Splunk", "CrowdStrike", "Palo Alto NGFW", "Zero Trust Architecture", "ISO 27001", "GDPR / Data Protection", "Penetration Testing"], sortOrder: 8 },
  { categoryId: "networking-and-infrastructure", label: "Networking & Infrastructure", description: "Network, server, and infrastructure management tools.", iconName: "Network", items: ["TCP/IP", "DNS", "DHCP", "VPN", "Cisco Networking", "MikroTik", "Ubiquiti", "Linux Servers", "Windows Server", "Nginx", "Apache", "HAProxy", "Structured cabling", "CCTV systems"], sortOrder: 9 },
  { categoryId: "cloud-and-devops", label: "Cloud & DevOps", description: "Cloud platforms and DevOps tools for deployment and operations.", iconName: "CloudCog", items: ["AWS", "Microsoft Azure", "Google Cloud", "Docker", "Kubernetes", "Git", "GitHub", "GitLab", "Linux", "Nginx", "Apache", "Terraform", "Ansible", "CI/CD pipelines"], sortOrder: 10 },
  { categoryId: "development-and-collaboration-tools", label: "Development & Collaboration Tools", description: "Tools for development workflow, design, and team collaboration.", iconName: "Wrench", items: ["Visual Studio Code", "IntelliJ IDEA", "Postman", "Jira", "Trello", "Figma", "Microsoft 365", "Windows Server", "Slack", "Notion", "GitHub Projects", "Confluence"], sortOrder: 11 },
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  console.log(`\n🚀  Seeding content collections → ${STRAPI_URL}\n`);

  await seed("🛡️  E-Visitors Features", "e-visitors-features", E_VISITORS_FEATURES, "label", (r) => r);
  await seed("🏁  Product Milestones", "product-milestones", PRODUCT_MILESTONES, "title", (r) => r);
  await seed("❓  FAQ Items", "faq-items", FAQ_ITEMS, "question", (r) => r);
  await seed("📅  Journey Stages", "journey-stages", JOURNEY_STAGES, "stage", (r) => r);
  await seed("💎  Company Values", "company-values", COMPANY_VALUES, "label", (r) => r);
  await seed("🎯  Focus Areas", "focus-areas", FOCUS_AREAS, "label", (r) => r);
  await seed("🏠  Home Story Slides", "home-story-slides", HOME_STORY_SLIDES, "slideId", (r) => r);
  await seed("📦  Innovation Products", "innovation-products", INNOVATION_PRODUCTS, "productId", (r) => r);
  await seed("⚙️  Innovation Services", "innovation-services", INNOVATION_SERVICES, "serviceId", (r) => r);
  await seed("🔧  Innovation Solutions", "innovation-solutions", INNOVATION_SOLUTIONS, "solutionId", (r) => r);
  await seed("💻  Technology Categories", "technology-categories", TECHNOLOGY_CATEGORIES, "categoryId", (r) => r);

  console.log("\n✨  Done! All content collections seeded.\n");
  console.log("   👉  E-Visitors feature screenshots — upload manually in Strapi admin.");
  console.log("   👉  Innovation product images — upload manually in Strapi admin.\n");
}

main().catch((err) => { console.error("\n💥", err); process.exit(1); });
