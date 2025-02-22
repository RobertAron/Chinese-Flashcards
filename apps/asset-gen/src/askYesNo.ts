import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline";

export async function askYesNo(query: string): Promise<boolean> {
  const rl = createInterface({
    input: stdin,
    output: stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${query} (yes/no): `, (answer) => {
      const normalizedAnswer = answer.trim().toLowerCase();
      const isYes = normalizedAnswer === "yes" || normalizedAnswer === "y";
      const isNo = normalizedAnswer === "no" || normalizedAnswer === "n";

      if (isYes) {
        rl.close();
        resolve(true);
      } else if (isNo) {
        rl.close();
        resolve(false);
      } else {
        console.log("Please answer yes or no.");
        rl.close();
        resolve(askYesNo(query)); // Recursive call until valid input
      }
    });
  });
}
