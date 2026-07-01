import React, { useState, useEffect } from "react";
import { useGameStore } from "../lib/store";
import { saveAs } from "file-saver";
import { testConnection } from "../lib/api";
import localforage from "localforage";

export function SettingsTab() {
  const {
    apiKey,
    setApiKey,
    difficultyModifier,
    setDifficultyModifier,
    systemPrompt,
    setSystemPrompt,
    saveGame,
    loadGame,
    worldBook,
    setWorldBook,
    character,
    setCharacter,
  } = useGameStore();
  const [saveSlot, setSaveSlot] = useState(1);
  const [loadSlot, setLoadSlot] = useState(1);
  const [toast, setToast] = useState("");
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    localforage.getItem<string>("hc_apikey").then((key) => {
      if (key && !apiKey) {
        setApiKey(key);
      }
    });
  }, [setApiKey, apiKey]);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const key = e.target.value;
    setApiKey(key);
    localforage.setItem("hc_apikey", key);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleExportWorld = () => {
    const blob = new Blob([worldBook], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "world_book.txt");
  };

  const handleImportWorld = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setWorldBook(e.target?.result as string);
      reader.readAsText(file);
    }
  };

  const handleExportChar = () => {
    if (!character) return showToast("没有可导出的角色");
    const blob = new Blob([JSON.stringify(character, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    saveAs(blob, "character.json");
  };

  const handleImportChar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const char = JSON.parse(e.target?.result as string);
          setCharacter(char);
          showToast("导入成功");
        } catch (err) {
          showToast("解析角色文件失败");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleTestConnection = async () => {
    if (!apiKey) return showToast("请先输入 API KEY");
    setIsTesting(true);
    try {
      const ok = await testConnection(apiKey);
      if (ok) showToast("连接成功！API KEY 有效。");
      else showToast("连接失败，请检查网络或 API KEY。");
    } catch (e: any) {
      showToast("连接失败：" + e.message);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto w-full p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {toast && (
        <div className="fixed top-4 right-4 bg-magic-surface border border-magic-border text-magic-text px-4 py-2 shadow-lg z-50">
          {toast}
        </div>
      )}

      <div className="bg-magic-surface p-6 border border-magic-border">
        <h2 className="text-xl font-bold mb-4 text-magic-text border-b border-magic-border pb-2">
          API 设置
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Deepseek API KEY
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={handleApiKeyChange}
                className="flex-1 px-3 py-2 bg-black/40 border border-magic-border focus:ring-1 focus:ring-magic-pink outline-none text-white text-sm"
                placeholder="sk-..."
              />
              <button
                onClick={handleTestConnection}
                disabled={isTesting}
                className="btn-action text-sm disabled:opacity-50"
              >
                {isTesting ? "测试中..." : "测试连接"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-magic-surface p-6 border border-magic-border">
        <h2 className="text-xl font-bold mb-4 text-magic-text border-b border-magic-border pb-2">
          游戏难度设置
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1 flex justify-between">
              <span>基础难度调整值</span>
              <span className="text-magic-pink font-mono">{difficultyModifier > 0 ? `+${difficultyModifier}` : difficultyModifier}</span>
            </label>
            <input
              type="range"
              min="-1"
              max="5"
              step="1"
              value={difficultyModifier}
              onChange={(e) => setDifficultyModifier(Number(e.target.value))}
              className="w-full accent-magic-pink"
            />
            <p className="text-xs text-slate-500 mt-1">此值将直接加在所有检定的目标难度上。正值增加难度，负值降低难度。</p>
          </div>
        </div>
      </div>

      <div className="bg-magic-surface p-6 border border-magic-border">
        <h2 className="text-xl font-bold mb-4 text-magic-text border-b border-magic-border pb-2">
          系统预设与世界观
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              系统总提示词
            </label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full px-3 py-2 bg-black/40 border border-magic-border focus:ring-1 focus:ring-magic-pink outline-none h-40 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              世界观设定 (可由模型生成或手写)
            </label>
            <textarea
              value={worldBook}
              onChange={(e) => setWorldBook(e.target.value)}
              className="w-full px-3 py-2 bg-black/40 border border-magic-border focus:ring-1 focus:ring-magic-pink outline-none h-40 text-sm"
            />
            <div className="mt-2 flex gap-2">
              <button
                onClick={handleExportWorld}
                className="btn-action text-xs px-3 py-1.5"
              >
                导出世界书
              </button>
              <label className="btn-action text-xs px-3 py-1.5 cursor-pointer flex items-center justify-center">
                导入世界书
                <input
                  type="file"
                  className="hidden"
                  accept=".txt"
                  onChange={handleImportWorld}
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
