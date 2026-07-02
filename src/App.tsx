import React, { useState, useEffect, useRef } from "react";
import { GameTab } from "./components/GameTab";
import { CharacterTab } from "./components/CharacterTab";
import { HistoryTab } from "./components/HistoryTab";
import { SettingsTab } from "./components/SettingsTab";
import { useGameStore } from "./lib/store";
import { saveAs } from "file-saver";

export default function App() {
  const [appState, setAppState] = useState<"title" | "playing">("title");
  const [activeTab, setActiveTab] = useState<
    "game" | "character" | "history" | "settings"
  >("game");
  const { loadGame, isGenerating, history, currentTurnId, setApiKey, apiKey } = useGameStore();
  const [showGenerationToast, setShowGenerationToast] = useState(false);
  const prevGenerating = useRef(isGenerating);

  // Initialize API key from localforage
  useEffect(() => {
    import("localforage").then((localforage) => {
      localforage.default.getItem<string>("hc_apikey").then((key) => {
        if (key && !apiKey) {
          setApiKey(key);
        }
      });
    });
  }, [setApiKey, apiKey]);

  // Monitor generation state to show toast if not on game tab
  useEffect(() => {
    if (
      prevGenerating.current &&
      !isGenerating &&
      activeTab !== "game" &&
      history.length > 0
    ) {
      setShowGenerationToast(true);
    }
    prevGenerating.current = isGenerating;
  }, [isGenerating, activeTab, history.length]);

  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
    if (tab === "game") setShowGenerationToast(false);
  };

  const handleExportSave = () => {
    const state = useGameStore.getState();
    const saveObj = {
      worldBook: state.worldBook,
      character: state.character,
      history: state.history,
      currentTurnId: state.currentTurnId,
      shortTermMemory: state.shortTermMemory,
      longTermMemory: state.longTermMemory
    };
    const blob = new Blob([JSON.stringify(saveObj, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    saveAs(blob, "magic_girl_save.json");
  };

  const handleImportSave = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const saveObj = JSON.parse(e.target?.result as string);
          useGameStore.setState({
            worldBook: saveObj.worldBook || "",
            character: saveObj.character || null,
            history: saveObj.history || [],
            currentTurnId: saveObj.currentTurnId || 1,
            shortTermMemory: saveObj.shortTermMemory || [],
            longTermMemory: saveObj.longTermMemory || []
          });
          alert("存档导入成功");
          setAppState("playing");
          setActiveTab("game");
        } catch (err) {
          alert("解析存档文件失败");
        }
      };
      reader.readAsText(file);
    }
  };

  if (appState === "title") {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-black text-magic-text selection:bg-magic-pink selection:text-black space-y-12 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-magic-pink/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="text-center z-10 space-y-4">
          <h1 className="text-5xl md:text-7xl font-black tracking-widest text-magic-pink drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]">
            魔法少女危机
          </h1>
          <p className="text-slate-400 tracking-widest">DARK FANTASY TRPG</p>
        </div>
        <div className="flex flex-col gap-4 z-10 w-64">
          <button
            onClick={() => {
              useGameStore.getState().resetGame();
              setAppState("playing");
              setActiveTab("game");
            }}
            className="px-6 py-3 bg-magic-surface border border-magic-border hover:border-magic-pink hover:bg-black/40 transition-all font-bold tracking-widest"
          >
            新游戏
          </button>
          <button
            onClick={async () => {
              const ok = await loadGame(0);
              if (ok) {
                setAppState("playing");
                setActiveTab("game");
              } else {
                alert("没有找到自动存档。");
              }
            }}
            className="px-6 py-3 bg-magic-surface border border-magic-border hover:border-blue-500 hover:bg-black/40 transition-all font-bold tracking-widest"
          >
            继续游戏 (自动存档)
          </button>
          <label className="px-6 py-3 bg-magic-surface border border-magic-border hover:border-magic-pink hover:bg-black/40 transition-all font-bold tracking-widest text-center cursor-pointer">
            导入存档
            <input type="file" className="hidden" accept=".json" onChange={handleImportSave} />
          </label>
          <button
            onClick={() => {
              setAppState("playing");
              setActiveTab("settings");
            }}
            className="px-6 py-3 bg-magic-surface border border-magic-border hover:border-magic-pink hover:bg-black/40 transition-all font-bold tracking-widest"
          >
            设置 (API)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 h-[100dvh] flex flex-col overflow-hidden selection:bg-magic-pink selection:text-black">
      <header className="h-16 border-b border-magic-border flex items-center justify-between px-6 bg-magic-surface shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => setAppState("title")} className="text-xl font-bold tracking-widest text-magic-pink hover:text-pink-400">
            魔法少女危机
          </button>
        </div>
        <nav className="flex gap-4 sm:gap-8 text-sm font-medium">
          <TabButton
            active={activeTab === "game"}
            onClick={() => handleTabChange("game")}
            label="故事"
          />
          <TabButton
            active={activeTab === "character"}
            onClick={() => handleTabChange("character")}
            label="角色"
          />
          <TabButton
            active={activeTab === "history"}
            onClick={() => handleTabChange("history")}
            label="历史"
          />
          <TabButton
            active={activeTab === "settings"}
            onClick={() => handleTabChange("settings")}
            label="设置"
          />
        </nav>
        <div className="flex items-center gap-4 text-xs">
          <div className="hidden sm:flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isGenerating ? "bg-yellow-500 animate-pulse" : "bg-green-500"
              }`}
            ></div>
            <span className="text-slate-400">
              大语言模型 {isGenerating ? "生成中..." : "就绪"}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {activeTab === "game" && <GameTab />}
        {activeTab === "character" && <CharacterTab />}
        {activeTab === "history" && <HistoryTab />}
        {activeTab === "settings" && <SettingsTab />}
      </main>

      <footer className="h-10 border-t border-magic-border bg-black flex items-center px-6 justify-between text-[10px] text-slate-500 shrink-0">
        <div>第 {currentTurnId} 回合</div>
        <div className="flex gap-4">
          <button onClick={handleExportSave} className="hover:text-magic-pink">导出当前存档</button>
        </div>
      </footer>

      {/* Generation Toast */}
      {showGenerationToast && (
        <div className="fixed bottom-16 right-6 bg-magic-surface border border-magic-border p-4 shadow-xl flex flex-col gap-3 z-50">
          <div className="text-sm font-medium text-magic-text">
            故事生成完毕！
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleTabChange("game")}
              className="bg-magic-pink text-black px-3 py-1.5 text-xs font-bold"
            >
              跳转回故事
            </button>
            <button
              onClick={() => setShowGenerationToast(false)}
              className="border border-slate-700 text-slate-300 px-3 py-1.5 text-xs"
            >
              留在原地
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`transition-colors ${
        active ? "text-magic-pink" : "text-slate-400 hover:text-magic-pink"
      }`}
    >
      {label}
    </button>
  );
}
