export function groupByFive<T>(arr: T[]): T[][] {
  const grouped: T[][] = [];
  for (let i = 0; i < arr.length; i += 5) {
    grouped.push(arr.slice(i, i + 5));
  }
  return grouped;
}

export const clamp = (value: number, min: number, max: number) =>
  value < min ? min : value > max ? max : value;
