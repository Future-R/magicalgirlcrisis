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

export function normalizeStringArray(input: any): string[] {
  if (!input) return [];
  if (typeof input === 'string') return [input];
  if (Array.isArray(input)) {
    return input.map(item => {
      if (typeof item === 'string') return item;
      if (typeof item === 'object' && item !== null) {
        if (item.名称) return String(item.名称);
        if (item.name) return String(item.name);
        return JSON.stringify(item);
      }
      return String(item);
    });
  }
  if (typeof input === 'object' && input !== null) {
    if (input.名称) return [String(input.名称)];
    if (input.name) return [String(input.name)];
    return [JSON.stringify(input)];
  }
  return [String(input)];
}

export function applyStateChange(
  character: Character,
  change?: StateChange,
  newCrisisActions?: string[],
  triggeredCrisisActions?: string[],
): Character {
  let newChar = JSON.parse(JSON.stringify(character)) as Character;

  let actionsToAdd: string[] = normalizeStringArray(newCrisisActions);

  if (actionsToAdd.length > 0) {
    if (!newChar.crisisActions) newChar.crisisActions = [];
    for (const action of actionsToAdd) {
      if (!newChar.crisisActions.includes(action)) {
        newChar.crisisActions.push(action);
      }
    }
  }

  // triggeredCrisisActions are just for history/UI currently, the state changes (CP/SP) should be already in `change` from the LLM.

  if (!change) return newChar;

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
