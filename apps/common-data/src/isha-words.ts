import type { WordDefinition } from "./types.js";

export const ishaWords = (
  [
    ["1", "的", "de", "p.", "of; possessive marker", "📎🔗"],
    ["2", "我", "wǒ", "pron.", "I; me", "🙋‍♂️"],
    ["11", "不", "bù", "adv.", "not", "🚫🙅"],
    ["4", "在", "zài", "prep./v.", "at; in; exist", "📍"],
    ["14", "也", "yě", "adv.", "also; too", "➕1️⃣"],
    ["6", "就", "jiù", "adv.", "then; at once", "➡️✅"],
    ["11", "有", "yǒu", "v.", "to have; to own", "🙌👜"],
    ["8", "是", "shì", "v.", "to be", "=️⃣"],
    ["3", "要", "yào", "m.v.", "need / want (commanding)", "--*"],
    ["18", "人", "rén", "n.", "person; people", "👤👥"],
    ["11", "都", "dōu", "adv.", "all; both", "🙅‍♂️◎  ✅◉"],
    ["12", "你", "nǐ", "pron.", "you", "💁‍♀️👉🙋‍♀️"],
    ["13", "和", "hé", "conj.", "and", "➕"],
    ["14", "那", "nà", "pron.", "that", "💁‍♀️👉🏆"],
    ["15", "她", "tā", "pron.", "she; her", "👩"],
    ["19", "看", "kàn", "v.", "to look at; to watch; to see", "👀📺"],
    ["17", "個", "gè", "m.", "general measure word", "📏"],
    ["18", "到", "dào", "v.", "to arrive; reach", "📍🚶 => ✅"],
    ["19", "一", "yī", "num.", "one", "1️⃣"],
    ["20", "这", "zhè", "pron.", "this", "👉📍"],
    ["21", "時", "shí", "n.", "time", "⌛"],
    ["22", "用", "yòng", "v.", "to use", "🔧"],
    ["23", "能", "néng", "aux.", "can; be able to", "⚡"],
    ["24", "但", "dàn", "conj.", "but; yet", "⚖️❓"],
    ["25", "很", "hěn", "adv.", "very", "👍🏻"],
    ["26", "還", "hái", "adv.", "still; yet", "⏳"],
    ["28", "讓", "ràng", "v.", "to let; allow", "👐"],
    ["29", "做", "zuò", "v.", "to do; make", "⚙️"],
    ["30", "再", "zài", "adv.", "again; once more", "🔄"],

    ["31", "忘", "wàng", "v.", "to forget", "💭❓"],
    ["32", "太", "tài", "adv.", "too; overly", "🔝"],
    ["33", "多", "duō", "adj.", "many; much", "🔢"],
    ["34", "天", "tiān", "n.", "sky; day", "☁️"],
    ["35", "好", "hǎo", "adj.", "good; well", "👍"],
    ["36", "著", "zhe", "p.", "is/are doing · in the state of", "🔄"],
    ["37", "見", "jiàn", "v.", "to see; meet", "👀🤝"],
    ["38", "連", "lián", "adv.", "even; including", "🔗"],
    ["39", "別", "bié", "adv.", "don't; other", "🚫✋"],
    ["40", "怕", "pà", "v.", "to fear; be afraid", "😨"],

    ["41", "腳", "jiǎo", "n.", "foot", "🦶"],
    ["42", "赤", "chì", "adj.", "red; bare", "🔴"],
    ["43", "荊", "jīng", "n.", "brambles", "🌿"],
    ["44", "棘", "jí", "n.", "thorn", "🌵"],
    ["45", "尋", "xún", "v.", "to search; seek", "🔎"],
    ["46", "珍", "zhēn", "adj.", "precious", "💎"],
    ["47", "貴", "guì", "adj.", "valuable; expensive", "💰"],
    ["48", "黑", "hēi", "adj.", "black; dark", "⚫"],
    ["49", "焰", "yàn", "n.", "flame", "🔥"],
    ["50", "火", "huǒ", "n.", "fire", "🔥🔥"],

    ["51", "美", "měi", "adj.", "beautiful", "🌸"],
    ["52", "無", "wú", "adv.", "no; not any", "🚫"],
    ["53", "需", "xū", "v.", "to need; require", "❗"],
    ["54", "傷", "shāng", "v./n.", "to hurt; injury", "🤕"],
    ["55", "悲", "bēi", "adj.", "sad; sorrowful", "😢"],
    ["56", "本", "běn", "n.", "origin; (m.w. for books)", "📚"],
    ["57", "茂", "mào", "adj.", "lush; flourishing", "🌱"],
    ["58", "盛", "shèng", "adj./v.", "prosperous; abundant", "🌻"],
    ["59", "枯", "kū", "adj.", "withered", "🥀"],
    ["60", "萎", "wěi", "v./adj.", "to wilt; wilted", "🥀"],

    ["61", "頑", "wán", "adj.", "stubborn; obstinate", "😤"],
    ["62", "石", "shí", "n.", "stone", "🪨"],
    ["63", "塊", "kuài", "m./n.", "piece; chunk", "🧩"],
    ["64", "壘", "lěi", "n.", "fortress; base", "🧱"],
    ["65", "開", "kāi", "v.", "to open; to bloom", "🌼"],
    ["66", "花", "huā", "n.", "flower", "🌺"],
    ["67", "蕊", "ruǐ", "n.", "flower stamen/pistil", "🌸"],
    ["68", "撥", "bō", "v.", "push aside; dial", "📞🤏"],
    ["69", "山", "shān", "n.", "mountain", "⛰️"],
    ["70", "嶺", "lǐng", "n.", "mountain ridge", "🏔️"],

    ["71", "告", "gào", "v.", "to tell (part of 告訴)", "📣"],
    ["72", "訴", "sù", "v.", "to inform; to tell", "🗣️"],
    ["73", "繁", "fán", "adj.", "numerous; complicated", "🔣"],
    ["74", "星", "xīng", "n.", "star", "⭐"],
    ["75", "快", "kuài", "adj.", "fast; quick", "⚡"],
    ["76", "些", "xiē", "m.", "some; a few", "📁"],
    ["77", "照", "zhào", "v.", "to shine; illuminate", "💡"],
    ["78", "亮", "liàng", "adj.", "bright", "✨"],
    ["79", "吹", "chuī", "v.", "to blow", "💨"],
    ["80", "散", "sàn", "v.", "disperse; scatter", "🌬️"],

    ["81", "烏", "wū", "adj.", "dark; black (lit. crow)", "⬛"],
    ["82", "云", "yún", "n.", "cloud", "☁️"],
    ["83", "抹", "mǒ", "v.", "to wipe; smear", "🩸"],
    ["84", "藍", "lán", "adj.", "blue", "🔵"],
    ["85", "色", "sè", "n.", "color", "🌈"],
    ["86", "算", "suàn", "v.", "to calculate; consider", "🧮"],
    ["87", "世", "shì", "n.", "world; generation", "🌍"],
    ["88", "界", "jiè", "n.", "boundary; world", "🌐"],
    ["89", "滿", "mǎn", "adj.", "full; filled", "🈵"],
    ["90", "荒", "huāng", "adj.", "desolate; barren", "🌵"],

    ["91", "蕪", "wú", "adj.", "overgrown; uncultivated", "🌾❌"],
    ["92", "們", "men", "suffix", "plural marker for people", "👥➕"],
    ["93", "抬", "tái", "v.", "to lift; raise", "🙌"],
    ["94", "頭", "tóu", "n.", "head", "🗣️"],
    ["95", "月", "yuè", "n.", "moon; month", "🌙"],
    ["96", "模", "mó", "n.", "pattern; model", "🔣"],
    ["97", "樣", "yàng", "n.", "appearance; shape", "🖼️"],
    ["98", "孩子", "hái zǐ", "n.", "child", "👶"],
    ["99", "雖", "suī", "conj.", "although; though", "🤔"],
    ["100", "千", "qiān", "num.", "thousand", "🔟🔟"],

    ["101", "萬", "wàn", "num.", "ten thousand", "🔟🔟🔟"],
    ["102", "孤", "gū", "adj.", "lonely; solitary", "🌑"],
    ["103", "芳", "fāng", "n.", "fragrance; aroma", "💐"],
    ["104", "憂", "yōu", "v./n.", "to worry; worry", "😟"],
    ["105", "煩", "fán", "v./adj.", "annoy; annoyed", "😤"],
    ["106", "惱", "nǎo", "n./v.", "anger; to be upset", "😠"],
    ["107", "流", "liú", "v.", "to flow", "💧"],
    ["108", "淚", "lèi", "n.", "tear", "😢"],
    ["109", "直", "zhí", "adj.", "straight; direct", "➡️"],
    ["110", "奔", "bēn", "v.", "to rush; run quickly", "🏃‍♂️💨"],

    ["111", "跑", "pǎo", "v.", "to run", "🏃"],
    ["112", "間", "jiān", "n.", "interval; space", "⌚🕰️"],
    ["113", "找", "zhǎo", "v.", "to look for; seek", "🔍"],
    ["114", "邊", "biān", "n.", "edge; side", "➰"],
    ["115", "飛", "fēi", "v.", "to fly", "🕊️"],
    ["116", "鳥", "niǎo", "n.", "bird", "🐦"],
    ["117", "給", "gěi", "v.", "to give", "🎁"],
    ["118", "擁", "yōng", "v.", "to embrace", "🤗"],
    ["119", "抱", "bào", "v.", "to hug; hold", "🫂"],
    ["120", "安", "ān", "adj.", "peaceful; safe", "🕊️"],

    ["121", "靜", "jìng", "adj.", "quiet; still", "🤫"],
    ["122", "地", "de", "p.", "adverbial marker", "🌐"],
    ["123", "掉", "diào", "v.", "to drop; fall off", "⬇️"],
  ] as const
).map(([_, characters, pinyin, __, definition, emoji], index): WordDefinition => {
  const id = `isha-words-${index}`;
  return {
    character: characters,
    definition,
    fileName: `${id}.mp3`,
    id,
    pinyin,
    emoji,
  };
});

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
