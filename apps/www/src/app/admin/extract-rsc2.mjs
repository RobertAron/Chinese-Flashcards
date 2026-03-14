const [bunPort, nodePort] = ["3000", "3002"];

async function getRSCFull(port) {
  const html = await fetch(`http://localhost:${port}/admin`).then(r => r.text());
  const re = /self\.__next_f\.push\(\[1,"((?:[^"\\]|\\[\s\S])*)"\]\)/g;
  let m, full = "";
  while ((m = re.exec(html)) !== null) full += JSON.parse('"' + m[1] + '"');
  return full;
}

const [bunFull, nodeFull] = await Promise.all([getRSCFull(bunPort), getRSCFull(nodePort)]);

function extractEntry(full, key) {
  const lines = full.split("\n");
  const results = [];
  for (const line of lines) {
    if (line.startsWith(`${key}:`)) results.push(line.slice(key.length + 1, key.length + 1 + 500));
  }
  return results;
}

// The c: entry defers to $d - let's find d:
console.log("=== BUN d: entries ===");
extractEntry(bunFull, "d").forEach((l, i) => console.log(`  [${i}] ${l.slice(0, 300)}`));
console.log("\n=== NODE d: entries ===");
extractEntry(nodeFull, "d").forEach((l, i) => console.log(`  [${i}] ${l.slice(0, 300)}`));

// Find the layout component reference ($L17 = PlayerProvider)
// Look for the entry that contains children/html/body
console.log("\n=== BUN entries containing 'PlayerProvider' or '$L17' ===");
bunFull.split("\n").filter(l => l.includes("PlayerProvider") || l.includes('"html"')).slice(0, 5).forEach(l => console.log(" ", l.slice(0, 300)));

console.log("\n=== NODE entries containing 'PlayerProvider' or '$L17' ===");
nodeFull.split("\n").filter(l => l.includes("PlayerProvider") || l.includes('"html"')).slice(0, 5).forEach(l => console.log(" ", l.slice(0, 300)));

// Find the line that has the actual layout JSX (html, body, PlayerProvider)
// Look for entry with $L1f (MotionProvider) or $L17 (PlayerProvider)
// Find which key contains the layout content
const bunLayoutLine = bunFull.split("\n").find(l => l.includes('"html"') && l.includes('"body"'));
const nodeLayoutLine = nodeFull.split("\n").find(l => l.includes('"html"') && l.includes('"body"'));
console.log("\n=== BUN layout line (html+body) ===");
console.log(bunLayoutLine?.slice(0, 800));
console.log("\n=== NODE layout line (html+body) ===");
console.log(nodeLayoutLine?.slice(0, 800));
