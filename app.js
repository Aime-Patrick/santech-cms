// app.js — cPanel Node.js App entry point for Strapi CMS
// cPanel looks for this file as the Application startup file.
// It boots Strapi through its programmatic API so cPanel can run this file
// directly instead of trying to require the Unix shell launcher in
// node_modules/.bin/strapi.

"use strict";

const { createStrapi } = require("@strapi/strapi");

const path = require("node:path");

process.chdir(__dirname);

async function start() {
  const app = createStrapi({
    appDir: __dirname,
    distDir: path.join(__dirname, "dist"),
  });
  await app.start();
}

start().catch((error) => {
  console.error("Failed to start Strapi", error);
  process.exitCode = 1;
});
