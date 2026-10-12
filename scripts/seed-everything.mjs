/**
 * Runs every CMS seed phase in dependency order.
 *
 * Usage:
 *   $env:STRAPI_API_TOKEN="<token>"; npm run seed:all
 */

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

if (process.loadEnvFile) {
  try {
    process.loadEnvFile();
  } catch {}
}

const phases = [
  ["foundation", "seed-foundation.mjs"],
  ["legacy", "seed-legacy.mjs"],
  ["content", "seed-content.mjs"],
  ["tech pulse", "seed-tech-pulse.mjs"],
  ["driving change topics", "seed-driving-change-topics.mjs"],
  ["core collections", "seed-all.mjs"],
  ["SAN HUB", "seed-san-hub.mjs"],
  ["standards", "seed-standards.mjs"],
];

function runPhase(label, scriptName) {
  const scriptPath = fileURLToPath(new URL(`./${scriptName}`, import.meta.url));

  return new Promise((resolve, reject) => {
    console.log(`\n▶ Seeding ${label}...`);
    const child = spawn(process.execPath, [scriptPath], {
      cwd: process.cwd(),
      env: process.env,
      stdio: "inherit",
    });

    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${label} seed failed${signal ? ` with ${signal}` : ` with exit code ${code}`}.`));
    });
  });
}

for (const [label, scriptName] of phases) {
  await runPhase(label, scriptName);
}

console.log("\n✅ All CMS seed phases completed.");
console.log("Manual media still required: logos, photos, certificates, cover images, screenshots, and video posters.");
