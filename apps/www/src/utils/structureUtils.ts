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
