/**
 * Seeds the 36-course SAN TECH HUB Professional Technology Training Catalogue.
 *
 * Usage:
 *   STRAPI_URL=https://cms.example.com \
 *   STRAPI_API_TOKEN=<token> \
 *   npm run seed:training-catalogue
 *
 * The script is safe to rerun. Records are matched by slug and updated instead
 * of duplicated. It never deletes existing content or media.
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
    await request(`/api/${endpoint}/${existing.documentId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    console.log(`Updated ${endpoint}: ${record[field]}`);
    return { ...existing, ...record };
  }

  const created = await request(`/api/${endpoint}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  console.log(`Created ${endpoint}: ${record[field]}`);
  return created.data;
}

const CATEGORIES = [
  ["Computer Systems & Digital Productivity", "Foundational computer skills, hardware, operating systems, office productivity, and AI-assisted workplace tools."],
  ["Programming & Software Development", "Programming, web, mobile, desktop, backend, database, and full-stack software engineering pathways."],
  ["Data Science, Analytics & Artificial Intelligence", "Data analysis, machine learning, deep learning, generative AI, data engineering, and MLOps."],
  ["Computer Networking, Servers & Cloud Computing", "Networking, Cisco, MikroTik, fiber, server administration, cloud platforms, and DevOps."],
  ["Cybersecurity & Digital Forensics", "Network defense, ethical hacking, penetration testing, digital forensics, security operations, and information security."],
  ["Electronics, Embedded Systems, IoT & Robotics", "Electronics, PCB design, microcontrollers, IoT, robotics, PLC, SCADA, and industrial automation."],
  ["Surveillance, Biometrics & Smart Security Systems", "CCTV, IP surveillance, biometric attendance, access control, video analytics, and smart parking systems."],
  ["Graphic Design, Multimedia & Digital Media", "Graphic design, branding, UI/UX, video, animation, digital content, marketing, e-commerce, and online business."],
  ["Enterprise Systems & Digital Transformation", "Enterprise software, business information systems, process automation, ICT project management, research, and innovation."],
  ["Emerging Technologies & Advanced Innovation", "Blockchain, smart contracts, 3D design, 3D printing, rapid prototyping, AR, and VR applications."],
].map(([name, description], index) => ({
  name,
  slug: toSlug(name),
  description,
  sortOrder: index + 1,
  isActive: true,
}));

const COURSES = [
  ["Computer Systems, Hardware & IT Support", "Computer Systems & Digital Productivity", "Covers computer fundamentals, hardware assembly, operating system installation, Windows and Linux basics, maintenance, troubleshooting, and technical support."],
  ["Office Productivity, Advanced Excel & AI Tools", "Computer Systems & Digital Productivity", "Comprehensive training in Microsoft Word, Excel, PowerPoint, Microsoft 365, Google Workspace, advanced spreadsheet analysis, professional reporting, and AI-assisted office productivity."],
  ["Python Programming & Software Development", "Programming & Software Development", "Covers programming fundamentals, Python syntax, object-oriented programming, data structures, algorithms, file handling, automation, and practical application development."],
  ["C, C++ & Object-Oriented Programming", "Programming & Software Development", "Covers structured programming, object-oriented design, memory management, algorithms, and application development using C and C++."],
  ["Frontend Web Development", "Programming & Software Development", "Develop modern responsive websites and interfaces using HTML, CSS, JavaScript, TypeScript, React.js, Next.js, and frontend development tools."],
  ["Backend Development & Database Management", "Programming & Software Development", "Learn server-side programming, REST APIs, authentication, database design, SQL, and application integration using Node.js, Express, Django, Flask, PostgreSQL, and MySQL."],
  ["Full-Stack Web Application Development", "Programming & Software Development", "Develop complete web applications by integrating React.js, Node.js, databases, APIs, authentication, testing, cloud hosting, and deployment."],
  ["Mobile & Desktop Application Development", "Programming & Software Development", "Develop applications for Android, iOS, and desktop platforms using technologies such as Flutter, React Native, Python, or C#, with platform-specific learning tracks."],
  ["Data Analytics & Business Intelligence", "Data Science, Analytics & Artificial Intelligence", "Covers advanced Excel, SQL, data cleaning, statistics, Power BI, data visualization, dashboards, business reporting, and decision-support systems."],
  ["Data Science & Machine Learning", "Data Science, Analytics & Artificial Intelligence", "Learn Python for data science, NumPy, Pandas, exploratory data analysis, feature engineering, machine learning algorithms, model evaluation, and predictive analytics."],
  ["Deep Learning & Computer Vision", "Data Science, Analytics & Artificial Intelligence", "Develop AI models using neural networks, TensorFlow or PyTorch, image processing, object detection, image classification, and real-world computer vision applications."],
  ["Generative AI, NLP & Intelligent Applications", "Data Science, Analytics & Artificial Intelligence", "Covers generative AI, prompt engineering, natural language processing, chatbots, AI assistants, speech recognition, text-to-speech, and integration of AI models into applications."],
  ["Data Engineering, AI Deployment & MLOps", "Data Science, Analytics & Artificial Intelligence", "Learn data pipelines, ETL, database integration, model deployment, cloud APIs, automated workflows, and monitoring of production AI systems."],
  ["Computer Networking & Cisco CCNA", "Computer Networking, Servers & Cloud Computing", "Covers networking fundamentals, IP addressing, subnetting, VLANs, switching, routing, network security, WAN technologies, Packet Tracer, and network troubleshooting."],
  ["Advanced Networking, MikroTik & Fiber Optics", "Computer Networking, Servers & Cloud Computing", "Focuses on MikroTik routers, wireless networks, fiber optic infrastructure, network design, bandwidth management, VoIP, and enterprise connectivity."],
  ["Windows & Linux Server Administration", "Computer Networking, Servers & Cloud Computing", "Covers Windows Server, Active Directory, DNS, DHCP, Linux administration, server security, virtualization, storage, backup, and enterprise IT infrastructure management."],
  ["Cloud Computing & DevOps Engineering", "Computer Networking, Servers & Cloud Computing", "Covers cloud fundamentals, AWS, Microsoft Azure, application deployment, Docker, Kubernetes, Git, GitHub, CI/CD pipelines, and infrastructure automation."],
  ["Cybersecurity & Network Defense", "Cybersecurity & Digital Forensics", "Build the skills needed for information security, network protection, firewall configuration, system hardening, access management, secure communications, and incident prevention."],
  ["Ethical Hacking & Penetration Testing", "Cybersecurity & Digital Forensics", "Provides practical training in authorized vulnerability assessment, penetration testing methodologies, web application security, laboratory exercises, and professional security reporting."],
  ["Digital Forensics, Security Operations & Information Security Management", "Cybersecurity & Digital Forensics", "Covers digital evidence handling, incident response, security monitoring, threat analysis, security policies, risk management, and data protection practices."],
  ["Electronics Engineering & PCB Design", "Electronics, Embedded Systems, IoT & Robotics", "Covers electronic components, circuit analysis, breadboarding, electronic measurements, circuit simulation, PCB design, soldering, testing, and hardware prototyping."],
  ["Embedded Systems & Microcontroller Programming", "Electronics, Embedded Systems, IoT & Robotics", "Develop embedded applications using Arduino, ESP32, ESP8266, Raspberry Pi, C/C++, sensors, actuators, communication protocols, and embedded system integration."],
  ["Internet of Things & Smart Systems Development", "Electronics, Embedded Systems, IoT & Robotics", "Design complete IoT systems involving sensors, microcontrollers, wireless communication, cloud databases, backend APIs, web dashboards, remote monitoring, and automated control."],
  ["Robotics & Intelligent Automation", "Electronics, Embedded Systems, IoT & Robotics", "Covers robot design, motors, sensors, microcontrollers, robotic control, computer vision, AI integration, autonomous navigation fundamentals, and practical robotics projects."],
  ["Industrial Automation, PLC & SCADA Systems", "Electronics, Embedded Systems, IoT & Robotics", "Covers industrial control systems, PLC programming, industrial sensors, actuators, automation logic, HMI design, SCADA monitoring, and industrial IoT applications."],
  ["CCTV & IP Surveillance Systems", "Surveillance, Biometrics & Smart Security Systems", "Covers CCTV planning, camera installation, DVR/NVR configuration, IP networking, RTSP streaming, recording, remote monitoring, and system maintenance."],
  ["Biometric Attendance & Access Control Systems", "Surveillance, Biometrics & Smart Security Systems", "Covers fingerprint and facial attendance terminals, RFID access systems, electronic locks, attendance software, database synchronization, and centralized cloud management."],
  ["Smart Surveillance, Video Analytics & Parking Management", "Surveillance, Biometrics & Smart Security Systems", "Integrates AI-based people counting, video analytics, smart parking barriers, vehicle recognition, occupancy management, monitoring dashboards, and connected security systems."],
  ["Graphic Design, Branding & UI/UX Design", "Graphic Design, Multimedia & Digital Media", "Covers visual communication, Adobe Photoshop, Illustrator, brand identity, Figma, interface design, prototyping, and professional digital product design."],
  ["Video Production, Animation & Digital Content Creation", "Graphic Design, Multimedia & Digital Media", "Covers video shooting, editing, motion graphics, CapCut, Adobe Premiere Pro, After Effects, AI-assisted media production, and content creation for digital platforms."],
  ["Digital Marketing, E-Commerce & Online Business", "Graphic Design, Multimedia & Digital Media", "Covers digital marketing strategies, social media management, SEO, content marketing, online stores, digital advertising, and online business analytics."],
  ["Enterprise Software & Business Information Systems", "Enterprise Systems & Digital Transformation", "Covers the design, implementation, and management of ERP, HR management, inventory, accounting, student management, digital records, and organizational information systems."],
  ["Business Process Automation & AI for Organizations", "Enterprise Systems & Digital Transformation", "Train professionals to improve workflows using AI tools, APIs, low-code platforms, automation services, data reporting, and intelligent business applications."],
  ["ICT Project Management, Research & Innovation", "Enterprise Systems & Digital Transformation", "Covers Agile project management, system analysis, requirements engineering, technical research, documentation, innovation management, product development, and technology entrepreneurship."],
  ["Blockchain Technology & Smart Contract Development", "Emerging Technologies & Advanced Innovation", "Covers blockchain architecture, decentralized applications, smart contracts, distributed ledgers, and real-world applications of blockchain technology."],
  ["3D Design, Printing & Immersive Technologies", "Emerging Technologies & Advanced Innovation", "Covers computer-aided design, 3D modeling, rapid prototyping, 3D printing, and introductory augmented and virtual reality application development."],
].map(([title, categoryName, description], index) => ({
  title,
  slug: toSlug(title),
  category: "Courses",
  courseCategory: categoryName,
  provider: "SAN TECH HUB",
  description,
  format: "Instructor-led theory, practical labs, assignments, and a working final project",
  duration: durationFor(categoryName),
  level: "Beginner, intermediate, or advanced pathway",
  badge: "Professional training catalogue",
  sortOrder: index + 1,
}));

function toSlug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function durationFor(categoryName) {
  if (categoryName === "Computer Systems & Digital Productivity") return "1–2 months";
  if (categoryName === "Surveillance, Biometrics & Smart Security Systems") return "1–3 months";
  if (categoryName === "Graphic Design, Multimedia & Digital Media") return "2–3 months";
  if (categoryName === "Enterprise Systems & Digital Transformation") return "1–3 months";
  return "3–6 months";
}

const categoryRecords = new Map();
for (const category of CATEGORIES) {
  const record = await upsert("course-categories", "slug", category);
  categoryRecords.set(category.name, record);
}

for (const course of COURSES) {
  const category = categoryRecords.get(course.courseCategory);
  if (!category?.documentId) {
    throw new Error(`Missing course category: ${course.courseCategory}`);
  }

  await upsert("san-hub-catalog-items", "slug", {
    ...course,
    courseCategory: category.documentId,
  });
}

console.log(`Training catalogue seed complete: ${CATEGORIES.length} categories, ${COURSES.length} courses.`);
