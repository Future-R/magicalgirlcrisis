export interface CharacterStats {
  physical: number; // 体力
  agility: number; // 运动力
  intelligence: number; // 智力
  magic: number; // 魔力
}

export interface CharacterAttributes {
  physical: number; // 物理属性
  magic: number; // 魔法属性
}

export interface DerivedStats {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  cp: number;
  iv: number;
  sp: {
    chest: number; // 胸
    waist: number; // 腰
    hip: number; // 尻
    mouth: number; // 口
    pain: number; // 痛
    mind: number; // 心
  };
  ap: {
    chest: number;
    waist: number;
  };
}

export interface Character {
  name: string;
  identityTrait: string;
  physicalTrait: string;
  personalityTrait: string;
  stats: CharacterStats;
  attributes: CharacterAttributes;
  derivedStats: DerivedStats;
  skills: string[];
  spells: string[];
  crisisAbilities: string[];
  equipment: string[];
  goals: string[];
  crisisActions: string[];
  background: string;
  level: number;
}

export interface ActionOption {
  text: string;
  attribute: "体力" | "运动力" | "智力" | "魔力";
  difficulty: number;
}

export interface StateChange {
  hp?: number;
  mp?: number;
  cp?: number;
  sp?: {
    chest?: number;
    waist?: number;
    hip?: number;
    mouth?: number;
    pain?: number;
    mind?: number;
  };
  ap?: {
    chest?: number;
    waist?: number;
  };
}

export interface TurnData {
  story: string;
  options: ActionOption[];
  state_changes: StateChange;
  new_crisis_actions?: string[];
  triggered_crisis_actions?: string[];
}

export interface Turn {
  id: number;
  story: string;
  options: ActionOption[];
  selectedAction?: string;
  checkResult?: string;
  stateChanges?: StateChange;
  newCrisisActions?: string[];
  triggeredCrisisActions?: string[];
}
