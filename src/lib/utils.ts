import { Character, StateChange } from "./types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function rollDice(
  attributeVal: number,
  difficulty: number,
): { total: number; resultStr: string; success: boolean } {
  const d1 = Math.floor(Math.random() * 6) + 1;
  const d2 = Math.floor(Math.random() * 6) + 1;
  const total = d1 + d2 + attributeVal;
  const success = total >= difficulty;
  const resultStr = `投掷 2d6 (${d1}+${d2}) + 属性加成(${attributeVal}) = ${total}。目标难度：${difficulty}。检定${success ? "成功" : "失败"}！`;
  return { total, resultStr, success };
}

export function applyStateChange(
  character: Character,
  change?: StateChange,
): Character {
  if (!change) return character;

  const newChar = JSON.parse(JSON.stringify(character)) as Character;

  if (change.hp) {
    newChar.derivedStats.hp = Math.min(
      newChar.derivedStats.maxHp,
      Math.max(0, newChar.derivedStats.hp + change.hp),
    );
  }
  if (change.mp) {
    newChar.derivedStats.mp = Math.min(
      newChar.derivedStats.maxMp,
      Math.max(0, newChar.derivedStats.mp + change.mp),
    );
  }
  if (change.cp) {
    newChar.derivedStats.cp = Math.max(0, newChar.derivedStats.cp + change.cp);
  }

  if (change.ap) {
    if (change.ap.chest) {
      newChar.derivedStats.ap.chest = Math.max(
        0,
        newChar.derivedStats.ap.chest + change.ap.chest,
      );
    }
    if (change.ap.waist) {
      newChar.derivedStats.ap.waist = Math.max(
        0,
        newChar.derivedStats.ap.waist + change.ap.waist,
      );
    }
  }

  if (change.sp) {
    const keys = ["chest", "waist", "hip", "mouth", "pain", "mind"] as const;
    keys.forEach((k) => {
      if (change.sp![k]) {
        newChar.derivedStats.sp[k] = Math.max(
          0,
          newChar.derivedStats.sp[k] + change.sp![k]!,
        );
      }
    });
  }

  return newChar;
}
