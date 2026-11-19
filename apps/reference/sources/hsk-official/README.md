Source: [新版HSK考试大纲 (official HSK 3.0 syllabus)](https://hsk.cn-bj.ufileos.com/3.0/%E6%96%B0%E7%89%88HSK%E8%80%83%E8%AF%95%E5%A4%A7%E7%BA%B21219.pdf)

`words.json` is generated from the vocabulary list (词汇大纲) in `official-hsk.pdf`:

```bash
bun run parse:hsk-official
```

It reads the PDF with [pdf.js](https://github.com/mozilla/pdf.js) (`pdfjs-dist`), so `bun install` is all the setup it needs. Level 7 covers the combined 7–9 band. Where the syllabus introduces extra parts of speech at a higher level (半 is "1（4）", "数、（副）"), those are listed under `laterSenses`.
