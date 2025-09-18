export const practiceCountColors = {
  0: {
    key: 0,
    min: 0,
    max: 100,
    background: "bg-blue-300",
    primary: "bg-blue-600",
    font: "text-blue-600",
  },
  1: {
    key: 1,
    min: 100,
    max: 250,
    background: "bg-green-300",
    primary: "bg-green-600",
    font: "text-green-600",
  },
  2: {
    key: 2,
    min: 250,
    max: 500,
    background: "bg-yellow-300",
    primary: "bg-yellow-600",
    font: "text-yellow-600",
  },
  3: {
    key: 3,
    min: 500,
    max: 1000,
    background: "bg-red-300",
    primary: "bg-red-600",
    font: "text-red-600",
  },
} as const;

export function practiceCountToColor(count: number) {
  if (count < 100) return practiceCountColors[0];
  if (count < 250) return practiceCountColors[1];
  if (count < 500) return practiceCountColors[2];
  return practiceCountColors[3];
}

export const timeAttackColors = {
  0: {
    key: 0,
    requiredTime: 100 * 1000,
    background: "bg-blue-300",
    primary: "bg-blue-600",
    font: "text-blue-600",
  },
  1: {
    key: 1,
    requiredTime: 75 * 1000,
    background: "bg-green-300",
    primary: "bg-green-600",
    font: "text-green-600",
  },
  2: {
    key: 2,
    requiredTime: 50 * 1000,
    background: "bg-yellow-300",
    primary: "bg-yellow-600",
    font: "text-yellow-600",
  },
  3: {
    key: 3,
    requiredTime: 25 * 1000,
    background: "bg-red-300",
    primary: "bg-red-600",
    font: "text-red-600",
  },
};

export function timeAttackCountToColor(count: number) {
  if (count < timeAttackColors[3].requiredTime) return timeAttackColors[3];
  if (count < timeAttackColors[2].requiredTime) return timeAttackColors[2];
  if (count < timeAttackColors[1].requiredTime) return timeAttackColors[1];
  if (count < timeAttackColors[0].requiredTime) return timeAttackColors[0];
  return null;
}
