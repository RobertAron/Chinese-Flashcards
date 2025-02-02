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

export const data: { character: string; pinyin: string; meaning: string }[] = [
  {
    character: "你好",
    pinyin: "nǐhǎo",
    meaning: "hello; hi",
  },
  {
    character: "再见",
    pinyin: "zàijiàn",
    meaning: "bye; goodbye",
  },
  {
    character: "请问",
    pinyin: "qǐngwèn",
    meaning: "please (allow me to) ask; excuse me",
  },
  {
    character: "知道",
    pinyin: "zhīdào",
    meaning: "to know; to be aware of",
  },
  {
    character: "好",
    pinyin: "hǎo",
    meaning: "good",
  },
  {
    character: "谢谢",
    pinyin: "xièxie",
    meaning: "thanks",
  },
  {
    character: "不客气",
    pinyin: "búkèqi",
    meaning: "you’re welcome",
  },
  {
    character: "对不起",
    pinyin: "duìbuqǐ",
    meaning: "sorry",
  },
  {
    character: "没关系",
    pinyin: "méiguānxi",
    meaning: "it doesn’t matter; that’s all right",
  },
  {
    character: "说",
    pinyin: "shuō",
    meaning: "to say; to speak",
  },
  {
    character: "有",
    pinyin: "yǒu",
    meaning: "to have; to own",
  },
  {
    character: "朋友",
    pinyin: "péngyou",
    meaning: "friend",
  },
  {
    character: "中文",
    pinyin: "Zhōngwén",
    meaning: "Chinese language",
  },
  {
    character: "喂",
    pinyin: "wèi",
    meaning: "hey; hello (on the phone)",
  },
  {
    character: "去",
    pinyin: "qù",
    meaning: "to go; to go over",
  },
  {
    character: "和",
    pinyin: "hé",
    meaning: "and",
  },
  {
    character: "今天",
    pinyin: "jīntiān",
    meaning: "today",
  },
  {
    character: "人",
    pinyin: "rén",
    meaning: "person; people",
  },
  {
    character: "叫",
    pinyin: "jiào",
    meaning: "to be called",
  },
  {
    character: "名字",
    pinyin: "míngzi",
    meaning: "name",
  },
];
