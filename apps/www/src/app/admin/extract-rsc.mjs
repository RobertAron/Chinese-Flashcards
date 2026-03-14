const [bunPort, nodePort] = ["3000", "3002"];

async function getRSCFull(port) {
  const html = await fetch(`http://localhost:${port}/admin`).then(r => r.text());
  // Collect all __next_f type=1 pushes in order and concatenate
  const re = /self\.__next_f\.push\(\[1,"((?:[^"\\]|\\[\s\S])*)"\]\)/g;
  let m, full = "";
  while ((m = re.exec(html)) !== null) {
    full += JSON.parse('"' + m[1] + '"');
  }
  return full;
}

const [bunFull, nodeFull] = await Promise.all([getRSCFull(bunPort), getRSCFull(nodePort)]);

// Extract just the c: chunk (layout RSC tree) from each
function extractEntry(full, key) {
  const idx = full.indexOf(`\n${key}:`);
  if (idx === -1) return null;
  return full.slice(idx + key.length + 2, idx + key.length + 2 + 2000);
}

// Find c: - the layout component tree
const bunC = extractEntry(bunFull, "c");
const nodeC = extractEntry(nodeFull, "c");

console.log("=== BUN c: (layout RSC tree) ===");
console.log(bunC?.slice(0, 1500));
console.log("\n=== NODE c: (layout RSC tree) ===");
console.log(nodeC?.slice(0, 1500));

// Check if children is a lazy ref ($@) or inline
const bunChildrenRef = bunC?.match(/\$[@L][0-9a-f]+/g);
const nodeChildrenRef = nodeC?.match(/\$[@L][0-9a-f]+/g);
console.log("\n=== BUN lazy refs in c: ===", bunChildrenRef);
console.log("=== NODE lazy refs in c: ===", nodeChildrenRef);

// Show the 0: router state to find what "c" resolves to
const bunRouter = extractEntry(bunFull, "0");
const nodeRouter = extractEntry(nodeFull, "0");
console.log("\n=== BUN 0: router first 500 chars ===");
console.log(bunRouter?.slice(0, 500));
console.log("\n=== NODE 0: router first 500 chars ===");
console.log(nodeRouter?.slice(0, 500));
