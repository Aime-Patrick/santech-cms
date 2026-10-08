// app.js — cPanel Node.js App entry point for Strapi CMS
// cPanel looks for this file as the Application startup file.
// It simply boots Strapi using the standard start command.

"use strict";
process.chdir(__dirname);
require("./node_modules/.bin/strapi").then?.() ?? require("./node_modules/@strapi/strapi/dist/node.js");
