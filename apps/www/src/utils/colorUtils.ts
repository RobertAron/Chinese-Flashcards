export const practiceCountColors = {
  0: {
    min: 0,
    max: 100,
    background: "bg-blue-300",
    primary: "bg-blue-600",
    font: "text-blue-600",
  },
  1: {
    min: 100,
    max: 250,
    background: "bg-green-300",
    primary: "bg-green-600",
    font: "text-green-600",
  },
  2: {
    min: 250,
    max: 500,

    background: "bg-yellow-300",
    primary: "bg-yellow-600",
    font: "text-yellow-600",
  },
  3: {
    min: 500,
    max: 1000,
    background: "bg-red-300",
    primary: "bg-red-600",
    font: "text-red-600",
  },
};

export function practiceCountToColor(count: number) {
  if (count < 100) return practiceCountColors[0];
  if (count < 250) return practiceCountColors[1];
  if (count < 500) return practiceCountColors[2];
  return practiceCountColors[3];
}
