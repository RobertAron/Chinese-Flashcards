import { getDb } from "./apps/db-orm/src/index";
import { drill as drillTable, drillToWords } from "./apps/db-orm/src/schema";
import path from "node:path";

// Construct the absolute path to the database file
const dbPath = path.resolve(__dirname, "apps/www/local.db");

console.log("Database path:", dbPath);
function groupByFive<T>(arr: T[]): T[][] {
  const grouped: T[][] = [];
  for (let i = 0; i < arr.length; i += 5) {
    grouped.push(arr.slice(i, i + 5));
  }
  return grouped;
}

const entries = `
为什么
我
却
不能够
成为
好
新娘
伤了
所有
的
人
难道
说
我
的
人
心
伤了
我
我
知道
如果
我
在
质疑
做
我
自己
我
会
失去
所有
人
为什么
我
眼里
看到
的
只有
我
却
在
此时
觉得
离
他
好
遥远
敞开
我
的
胸怀
去
追寻
去
呐喊
是否
真心
的
自我
让
烦恼
不再
是否
真心
的
自我
让
烦恼
不再`;

function deDupe<T, U>(arr: T[], cb: (ele: T) => U) {
  const soFar = new Set<U>();
  return arr.filter((ele) => {
    const key = cb(ele);
    if (soFar.has(key)) return false;
    soFar.add(key);
    return true;
  });
}

const db = getDb(dbPath);

const groupedDrills = groupByFive(entries.trim().split("\n"));
async function main() {
  for (let i = 0; i < groupedDrills.length; i++) {
    const deduped = deDupe(groupedDrills[i], (ele) => ele);
    const [{id}] = await db.insert(drillTable).values({
      slug: `mulan-reflection-${i}`,
      description: "",
      lessonSlug: "mulan-reflection",
      title: `Mulan Reflection ${i + 1}`,
    }).returning({
      id:drillTable.slug
    });
    const words = await db.query.words.findMany({
      where: (t, { inArray }) => inArray(t.characters, deduped),
    });
    await db.insert(drillToWords).values(words.map((ele)=>({a:id,b:ele.id})))
  }
}
main();
