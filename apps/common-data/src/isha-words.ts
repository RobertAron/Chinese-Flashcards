import type { WordDefinition } from "./types.js";

export const ishaWords = (
  [
    [0, "的", "de", "p.", "of; possessive marker", "📎🔗"],
    [1, "我", "wǒ", "pron.", "I; me", "🙋‍♂️"],
    [2, "不", "bù", "adv.", "not", "🚫🙅"],
    [3, "在", "zài", "prep./v.", "at; in; exist", "📍"],
    [4, "也", "yě", "adv.", "also; too", "➕1️⃣"],
    [5, "就", "jiù", "adv.", "then; at once", "➡️✅"],
    [6, "有", "yǒu", "v.", "to have; to own", "🙌👜"],
    [7, "是", "shì", "v.", "to be", "=️⃣"],
    [8, "要", "yào", "m.v.", "need / want (commanding)", "--*"],
    [9, "人", "rén", "n.", "person; people", "👤👥"],
    [10, "都", "dōu", "adv.", "all; both", "🙅‍♂️◎  ✅◉"],
    [11, "你", "nǐ", "pron.", "you", "💁‍♀️👉🙋‍♀️"],
    [12, "和", "hé", "conj.", "and", "➕"],
    [13, "那", "nà", "pron.", "that", "💁‍♀️👉🏆"],
    [14, "她", "tā", "pron.", "she; her", "👩"],
    [15, "看", "kàn", "v.", "to look at; to watch; to see", "👀📺"],
    [16, "个", "gè", "m.", "general measure word", "📏"],
    [17, "到", "dào", "v.", "to arrive; reach", "📍🚶 => ✅"],
    [18, "一", "yī", "num.", "one", "1️⃣"],
    [19, "这", "zhè", "pron.", "this", "👉📍"],
    [20, "时", "shí", "n.", "time", "⌛"],
    [21, "用", "yòng", "v.", "to use", "👨‍🚒 => 💧"],
    [22, "能", "néng", "aux.", "can; be able to", "🏹🎯/🏃‍➡️🏁"],
    [23, "但", "dàn", "conj.", "but; yet", "⚖️❓"],
    [24, "很", "hěn", "adv.", "very", "➕➕"],
    [25, "还", "hái", "adv.", "still; yet", "⏳"],
    [27, "让", "ràng", "v.", "to let; allow", "👐"],
    [28, "做", "zuò", "v.", "to do; make", "⚙️"],
    [29, "再", "zài", "adv.", "again; once more", "🔄"],
    [30, "忘", "wàng", "v.", "to forget", "💭❓"],
    [31, "太", "tài", "adv.", "too; overly", "🔝"],
    [32, "多", "duō", "adj.", "many; much", "🔢"],
    [33, "天", "tiān", "n.", "sky; day", "☁️"],
    [34, "好", "hǎo", "adj.", "good; well", "👍"],
    [35, "着", "zhe", "p.", "is/are doing · in the state of", "🔄"],
    [36, "见", "jiàn", "v.", "to see; meet", "👀🤝"],
    [37, "连", "lián", "adv.", "even; including", "🔗"],
    [38, "别", "bié", "adv.", "don't; other", "🚫✋"],
    [39, "怕", "pà", "v.", "to fear; be afraid", "😨"],
    [40, "脚", "jiǎo", "n.", "foot", "🦶"],
    [41, "赤", "chì", "adj.", "red; bare", "🔴"],
    [42, "荆", "jīng", "n.", "brambles", "🌿"],
    [43, "棘", "jí", "n.", "thorn", "🌵"],
    [44, "寻", "xún", "v.", "to search; seek", "🔎"],
    [45, "珍", "zhēn", "adj.", "precious", "💎"],
    [46, "贵", "guì", "adj.", "valuable; expensive", "💰"],
    [47, "黑", "hēi", "adj.", "black; dark", "⚫"],
    [48, "焰", "yàn", "n.", "flame", "🔥"],
    [49, "火", "huǒ", "n.", "fire", "🔥🔥"],
    [50, "美", "měi", "adj.", "beautiful", "🌸"],
    [51, "无", "wú", "adv.", "no; not any", "🚫"],
    [52, "需", "xū", "v.", "to need; require", "❗"],
    [53, "伤", "shāng", "v./n.", "to hurt; injury", "🤕"],
    [54, "悲", "bēi", "adj.", "sad; sorrowful", "😢"],
    [55, "本", "běn", "n.", "origin; (m.w. for books)", "📚"],
    [56, "茂", "mào", "adj.", "lush; flourishing", "🌱"],
    [57, "盛", "shèng", "adj./v.", "prosperous; abundant", "🌻"],
    [58, "枯", "kū", "adj.", "withered", "🥀"],
    [59, "萎", "wěi", "v./adj.", "to wilt; wilted", "🥀"],
    [60, "顽", "wán", "adj.", "stubborn; obstinate", "😤"],
    [61, "石", "shí", "n.", "stone", "🪨"],
    [62, "块", "kuài", "m./n.", "piece; chunk", "🧩"],
    [63, "垒", "lěi", "n.", "fortress; base", "🧱"],
    [64, "开", "kāi", "v.", "to open; to bloom", "🌼"],
    [65, "花", "huā", "n.", "flower", "🌺"],
    [66, "蕊", "ruǐ", "n.", "flower stamen/pistil", "🌸"],
    [67, "拨", "bō", "v.", "push aside; dial", "📞🤏"],
    [68, "山", "shān", "n.", "mountain", "⛰️"],
    [69, "岭", "lǐng", "n.", "mountain ridge", "🏔️"],
    [70, "告", "gào", "v.", "to tell (part of 告诉)", "📣"],
    [71, "诉", "sù", "v.", "to inform; to tell", "🗣️"],
    [72, "繁", "fán", "adj.", "numerous; complicated", "🔣"],
    [73, "星", "xīng", "n.", "star", "⭐"],
    [74, "快", "kuài", "adj.", "fast; quick", "⚡"],
    [75, "些", "xiē", "m.", "some; a few", "📁"],
    [76, "照", "zhào", "v.", "to shine; illuminate", "💡"],
    [77, "亮", "liàng", "adj.", "bright", "✨"],
    [78, "吹", "chuī", "v.", "to blow", "💨"],
    [79, "散", "sàn", "v.", "disperse; scatter", "🌬️"],
    [80, "乌", "wū", "adj.", "dark; black (lit. crow)", "⬛"],
    [81, "云", "yún", "n.", "cloud", "☁️"],
    [82, "抹", "mǒ", "v.", "to wipe; smear", "🩸"],
    [83, "蓝", "lán", "adj.", "blue", "🔵"],
    [84, "色", "sè", "n.", "color", "🌈"],
    [85, "算", "suàn", "v.", "to calculate; consider", "🧮"],
    [86, "世", "shì", "n.", "world; generation", "🌍"],
    [87, "界", "jiè", "n.", "boundary; world", "🌐"],
    [88, "满", "mǎn", "adj.", "full; filled", "🈵"],
    [89, "荒", "huāng", "adj.", "desolate; barren", "🌵"],
    [90, "芜", "wú", "adj.", "overgrown; uncultivated", "🌾❌"],
    [91, "们", "men", "suffix", "plural marker for people", "👥➕"],
    [92, "抬", "tái", "v.", "to lift; raise", "🙌"],
    [93, "头", "tóu", "n.", "head", "🗣️"],
    [94, "月", "yuè", "n.", "moon; month", "🌙"],
    [95, "模", "mó", "n.", "pattern; model", "🔣"],
    [96, "样", "yàng", "n.", "appearance; shape", "🖼️"],
    [97, "孩子", "hái zǐ", "n.", "child", "👶"],
    [98, "虽", "suī", "conj.", "although; though", "🤔"],
    [99, "千", "qiān", "num.", "thousand", "🔟🔟"],
    [100, "万", "wàn", "num.", "ten thousand", "🔟🔟🔟"],
    [101, "孤", "gū", "adj.", "lonely; solitary", "🌑"],
    [102, "芳", "fāng", "n.", "fragrance; aroma", "💐"],
    [103, "忧", "yōu", "v./n.", "to worry; worry", "😟"],
    [104, "烦", "fán", "v./adj.", "annoy; annoyed", "😤"],
    [105, "恼", "nǎo", "n./v.", "anger; to be upset", "😠"],
    [106, "流", "liú", "v.", "to flow", "💧"],
    [107, "泪", "lèi", "n.", "tear", "😢"],
    [108, "直", "zhí", "adj.", "straight; direct", "➡️"],
    [109, "奔", "bēn", "v.", "to rush; run quickly", "🏃‍♂️💨"],
    [110, "跑", "pǎo", "v.", "to run", "🏃"],
    [111, "间", "jiān", "n.", "interval; space", "⌚🕰️"],
    [112, "找", "zhǎo", "v.", "to look for; seek", "🔍"],
    [113, "边", "biān", "n.", "edge; side", "➰"],
    [114, "飞", "fēi", "v.", "to fly", "🕊️"],
    [115, "鸟", "niǎo", "n.", "bird", "🐦"],
    [116, "给", "gěi", "v.", "to give", "🎁"],
    [117, "拥", "yōng", "v.", "to embrace", "🤗"],
    [118, "抱", "bào", "v.", "to hug; hold", "🫂"],
    [119, "安", "ān", "adj.", "peaceful; safe", "🕊️"],
    [120, "静", "jìng", "adj.", "quiet; still", "🤫"],
    [121, "地", "de", "p.", "adverbial marker", "🌐"],
    [122, "掉", "diào", "v.", "to drop; fall off", "⬇️"],
  ] as const
).map(
  ([index, characters, pinyin, __, definition, emoji]): WordDefinition => {
    const id = `isha-words-${index}`;
    return {
      character: characters,
      definition,
      fileName: `${id}.mp3`,
      id,
      pinyin,
      emoji,
    };
  }
);

const lyrics = `
孩子別 怕荊棘 赤著腳
就 能尋到 珍貴
你看這個 天黑 焰火有多美
無需太多 的傷悲
人本都在 茂盛枯萎
但頑石和塊壘 也開花蕊
撥開山嶺 讓她看看我
告訴繁星 快些照亮我
吹散烏云 用一抹藍色
那就算 世界滿是荒蕪我們 抬頭就能 看見月亮
在我們還是 孩子的模樣
做雖千萬人 也要盛開 的孤芳
別再憂傷煩惱
別忘
就算流淚 也要一直 奔跑
跑到連時 間都 找不到
做天邊的飛鳥
撥開山嶺 讓她看看我
告訴繁星 快些照亮我
吹散烏云 用一抹藍色
那就算 世界滿是荒蕪我們 抬頭就能 看見月亮
在我們還是 孩子的模樣
做雖千萬人 也要盛開 的孤芳
別再憂傷煩惱
別忘
就算流淚 也要一直 奔跑
跑到連時 間都 找不到
做天邊的飛鳥
別再尋找
給我一個擁抱
就安靜地忘掉
我這樣就很好
`;
