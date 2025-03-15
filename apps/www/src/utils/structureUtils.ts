export function randomIntegerBetween(a: number, b: number) {
  const range = b - a;
  return Math.floor(Math.random() * (range + 1)) + a;
}
/**
 * Shuffle the given array.
 * Don't let the last element of the array be the first in the resulting array.
 * */
export function semiShuffle<T>(array: T[]): T[] {
  const sourceItems = array.slice();
  const result: T[] = [];
  const itemIndex = randomIntegerBetween(0, sourceItems.length - 2);
  result.push(sourceItems.splice(itemIndex, 1)[0]!);
  while (sourceItems.length > 0) {
    const itemIndex = randomIntegerBetween(0, sourceItems.length - 1);
    result.push(sourceItems.splice(itemIndex, 1)[0]!);
  }
  return result;
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