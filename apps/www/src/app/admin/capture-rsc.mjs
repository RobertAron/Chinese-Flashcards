#!/usr/bin/env node
/**
 * Captures the RSC payload (__next_f.push) from the admin page.
 * Usage:
 *   node capture-rsc.mjs [port] [output-file]
 *
 * Run the bun server on port 3000:    node capture-rsc.mjs 3000 rsc-bun.txt
 * Run the node server on port 3001:   node capture-rsc.mjs 3001 rsc-node.txt
 * Then diff them:                     diff rsc-bun.txt rsc-node.txt
 */

const port = process.argv[2] || "3000";
const outputFile = process.argv[3] || `rsc-port${port}.txt`;
const url = `http://localhost:${port}/admin`;

console.log(`Fetching ${url} ...`);
const res = await fetch(url);
const html = await res.text();

// Extract all self.__next_f.push([...]) calls
const rscChunks = [];
const rscRegex = /self\.__next_f\.push\((\[.*?\])\)/gs;
let match;
while ((match = rscRegex.exec(html)) !== null) {
  try {
    const parsed = JSON.parse(match[1]);
    rscChunks.push(parsed);
  } catch {
    rscChunks.push(match[1]); // raw if JSON parse fails
  }
}

// Also extract <script> tags content order (to see streaming order)
const scriptOrder = [];
const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/g;
let i = 0;
while ((scriptRegex.exec(html)) !== null) {
  i++;
}
const totalScripts = i;

// Format output
const lines = [
  `=== RSC Payload from ${url} ===`,
  `=== Total HTML length: ${html.length} ===`,
  `=== Total <script> tags: ${totalScripts} ===`,
  `=== RSC chunks (${rscChunks.length} total) ===`,
  "",
];

for (let j = 0; j < rscChunks.length; j++) {
  const chunk = rscChunks[j];
  lines.push(`--- chunk ${j} ---`);
  if (Array.isArray(chunk)) {
    const [type, ...rest] = chunk;
    // type 0 = tree, 1 = module, 2 = hint, 3 = error, etc.
    lines.push(`  type: ${type}`);
    if (type === 0) {
      // RSC tree - format nicely
      lines.push(`  content: ${JSON.stringify(rest, null, 2).split("\n").join("\n  ")}`);
    } else {
      lines.push(`  content: ${JSON.stringify(rest).slice(0, 300)}`);
    }
  } else {
    lines.push(`  raw: ${String(chunk).slice(0, 300)}`);
  }
  lines.push("");
}

// Also dump the raw RSC flight data (the "1:" "2:" lines)
lines.push("=== Raw RSC flight text (inline script content) ===");
const flightRegex = /self\.__next_f\.push\(\[(\d+),(.*?)\]\)/gs;
let fm;
while ((fm = flightRegex.exec(html)) !== null) {
  const type = fm[1];
  const payload = fm[2].slice(0, 500);
  lines.push(`[type=${type}] ${payload}`);
}

import { writeFileSync } from "fs";
writeFileSync(outputFile, lines.join("\n"), "utf8");
console.log(`Written to ${outputFile} (${lines.length} lines)`);
console.log(`RSC chunks found: ${rscChunks.length}`);
