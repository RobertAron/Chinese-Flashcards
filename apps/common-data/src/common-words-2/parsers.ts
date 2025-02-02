// https://chinesefor.us/lessons/1000-most-common-chinese-words-for-beginners-lesson-01/
// copy(JSON.stringify((function getData() {
//   const content = document.querySelectorAll(".fl-module-content tbody tr+tr");
//   const parsedRaw = [...content].map((ele) => [...ele.querySelectorAll("td")].map((ele) => ele.textContent?.trim()));
//   return parsedRaw.map((ele)=>({
//     character:ele[1],
//     pinyin:ele[2],
//     meaning:ele[4],
//   }))
// })(),null,2));

// import puppeteer from "puppeteer";

// console.log('starting...');

// (async () => {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();
//   const results = [];
//   console.log('hmm')

//   for (let i = 6; i <= 20; i++) {
//     const lesson = i.toString().padStart(2, "0");
//     const url = `https://chinesefor.us/lessons/1000-most-common-chinese-words-for-beginners-lesson-${lesson}/`;
//     await page.goto(url, { waitUntil: "networkidle0" });
    
//     const data = await page.evaluate(() => {
//       const listItems = [...document.querySelectorAll(".fl-rich-text li")];
//       return listItems.map((ele) => {
//         const parts = ele.textContent?.split("▸");
//         const firstPart = parts?.[0];
//         const character = firstPart?.split(" ")[0].trim();
//         const pinyin = firstPart?.split(" ").slice(1).join(" ").trim();
//         const meaning = parts?.at(-1)?.split(".").at(-1)?.trim();
//         return { character, pinyin, meaning };
//       });
//     });

//     results.push({ url, data });
//   }

//   console.log(JSON.stringify(results, null, 2));
//   await browser.close();
// })();
