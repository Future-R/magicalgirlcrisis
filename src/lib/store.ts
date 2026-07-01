import { create } from "zustand";
import localforage from "localforage";
import { Character, Turn } from "./types";
import { DEFAULT_SYSTEM_PROMPT } from "./api";

export interface GameState {
  apiKey: string;
  difficultyModifier: number;
  systemPrompt: string;
  worldBook: string;
  character: Character | null;
  shortTermMemory: string[];
  longTermMemory: string[];
  history: Turn[];
  currentTurnId: number;
  isGenerating: boolean;

  setApiKey: (key: string) => void;
  setDifficultyModifier: (val: number) => void;
  setSystemPrompt: (prompt: string) => void;
  setWorldBook: (wb: string) => void;
  setCharacter: (char: Character | null) => void;

  addHistory: (turn: Turn) => void;
  updateHistory: (id: number, turn: Partial<Turn>) => void;

  addShortTermMemory: (memory: string) => void;
  compressMemories: (newLongTerm: string, numRemoved: number) => void;

  setIsGenerating: (val: boolean) => void;

  saveGame: (slot: number) => Promise<void>;
  loadGame: (slot: number) => Promise<boolean>;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  apiKey: "",
  difficultyModifier: 2,
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  worldBook:
    "一开始，世界被分成三份。我们人类居住的地方被称为地上界。神和天使在天界无所事事。恶魔和魔族在魔界折腾他们自己的东西。这三个世界互相不能干涉彼此，一直没有冲突出现。然而，平衡被破坏了。一开始只是天神和魔王的口角之争，慢慢发展成了小规模的冲突战斗。而战斗并不止于此。魔族对人类的侵食开始了。天界派遣了最低级的天使来到地上界。这是一种被称为“小天禧”的毛茸茸小动物一样的生物。它们引导具有魔力的少女进行战斗，反抗魔族的侵略。",
  character: null,
  shortTermMemory: [],
  longTermMemory: [],
  history: [],
  currentTurnId: 1,
  isGenerating: false,

  setApiKey: (key) => set({ apiKey: key }),
  setDifficultyModifier: (val) => set({ difficultyModifier: val }),
  setSystemPrompt: (prompt) => set({ systemPrompt: prompt }),
  setWorldBook: (wb) => set({ worldBook: wb }),
  setCharacter: (char) => set({ character: char }),

  addHistory: (turn) =>
    set((state) => ({
      history: [...state.history, turn],
      currentTurnId: turn.id,
    })),

  updateHistory: (id, turnData) =>
    set((state) => ({
      history: state.history.map((t) =>
        t.id === id ? { ...t, ...turnData } : t,
      ),
    })),

  addShortTermMemory: (memory) =>
    set((state) => ({
      shortTermMemory: [...state.shortTermMemory, memory],
    })),

  compressMemories: (newLongTerm, numRemoved) =>
    set((state) => ({
      shortTermMemory: state.shortTermMemory.slice(numRemoved),
      longTermMemory: [...state.longTermMemory, newLongTerm],
    })),

  setIsGenerating: (val) => set({ isGenerating: val }),

  saveGame: async (slot: number) => {
    const state = get();
    const saveData = {
      worldBook: state.worldBook,
      character: state.character,
      shortTermMemory: state.shortTermMemory,
      longTermMemory: state.longTermMemory,
      history: state.history,
      currentTurnId: state.currentTurnId,
      difficultyModifier: state.difficultyModifier,
    };
    await localforage.setItem(`hc_save_slot_${slot}`, saveData);
  },

  loadGame: async (slot: number) => {
    const saveData = await localforage.getItem<any>(`hc_save_slot_${slot}`);
    if (saveData) {
      set({
        worldBook: saveData.worldBook,
        character: saveData.character,
        shortTermMemory: saveData.shortTermMemory || [],
        longTermMemory: saveData.longTermMemory || [],
        history: saveData.history || [],
        currentTurnId: saveData.currentTurnId || 1,
        difficultyModifier: saveData.difficultyModifier !== undefined ? saveData.difficultyModifier : 2,
      });
      return true;
    }
    return false;
  },

  resetGame: () => {
    set({
      worldBook: "",
      character: null,
      shortTermMemory: [],
      longTermMemory: [],
      history: [],
      currentTurnId: 1,
    });
  },
}));
