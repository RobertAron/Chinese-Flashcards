import { lookup } from "./index";

const words = process.argv.slice(2);
if (words.length === 0) {
  console.error("Usage: bun run lookup <simplified> [...more]");
  process.exit(1);
}

for (const word of words) {
  console.log(JSON.stringify((await lookup(word)) ?? { simplified: word, found: false }, null, 2));
}
