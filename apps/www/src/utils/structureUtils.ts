export function randomIntegerBetween(a: number, b: number) {
  const range = b - a;
  return Math.floor(Math.random() * (range + 1)) + a;
}

export function shuffle<T>(array: T[]): T[] {
  const sourceItems = array.slice();
  const result: T[] = [];
  while (sourceItems.length > 0) {
    const itemIndex = randomIntegerBetween(0, sourceItems.length - 1);
    result.push(sourceItems.splice(itemIndex, 1)[0]!);
  }
  return result;
}
/**
 * Shuffle the given array.
 * Don't let the last element of the array be the first in the resulting array.
 * */
export function semiShuffle<T>(array: T[]): T[] {
  // not shuffle-able
  if (array.length <= 1) return array;
  const lastItem = array.at(-1)!;
  const shuffled = shuffle(array);
  if (shuffled[0] === lastItem) {
    // move it somewhere else...
    const swapIndex = randomIntegerBetween(1, shuffled.length - 1);
    shuffled[0] = shuffled[swapIndex]!;
    shuffled[swapIndex] = lastItem;
  }
  return shuffled;
}

export function deDupe<T, U>(arr: T[], cb: (ele: T) => U) {
  const soFar = new Set<U>();
  return arr.filter((ele) => {
    const key = cb(ele);
    if (soFar.has(key)) return false;
    soFar.add(key);
    return true;
  });
}

/**
 * Group items by a key, shuffle within each group, shuffle the groups, then flatten.
 */
export function groupedShuffle<T>(items: T[], getKey: (item: T) => string): T[] {
  const grouped = Object.groupBy(items, getKey);
  const groups = Object.values(grouped)
    .filter((group): group is T[] => group !== undefined)
    .map((group) => shuffle(group));
  return shuffle(groups).flat();
}

/**
 * Like semiShuffle but for grouped items. Shuffles within each group, then shuffles
 * groups ensuring the last item's group doesn't end up first.
 */
export function semiGroupedShuffle<T>(items: T[], getKey: (item: T) => string): T[] {
  const lastItem = items.at(-1);
  if (lastItem === undefined) return [];
  const lastKey = getKey(lastItem);
  const grouped = Object.groupBy(items, getKey);
  const entries = Object.entries(grouped)
    .filter((ele): ele is [string, T[]] => ele[1] !== undefined)
    .map(([key, group]): [string, T[]] => [key, shuffle(group)]);
  if (entries.length <= 1) return entries.flatMap(([, group]) => group);
  // Move lastKey entry to end so semiShuffle treats it as "last"
  const lastIndex = entries.findIndex(([key]) => key === lastKey);
  if (lastIndex !== -1 && lastIndex !== entries.length - 1) {
    const [entry] = entries.splice(lastIndex, 1);
    entries.push(entry!);
  }
  return semiShuffle(entries).flatMap(([, group]) => group);
}
