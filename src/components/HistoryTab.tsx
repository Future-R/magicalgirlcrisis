import React from "react";
import { useGameStore } from "../lib/store";

export function HistoryTab() {
  const { history } = useGameStore();

  if (history.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto w-full p-4 md:p-8">
        <div className="max-w-2xl mx-auto p-6 border border-magic-border bg-magic-surface text-center text-slate-500">
          暂无游戏历史记录。
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto w-full p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {history.map((turn, index) => (
        <div
          key={turn.id}
          className="bg-magic-surface p-6 border border-magic-border relative"
        >
          <div className="flex justify-between items-center mb-4 border-b border-magic-border pb-2">
            <h3 className="font-bold text-slate-300 tracking-widest uppercase">
              第 {index + 1} 回合
            </h3>
          </div>
          <div className="prose prose-sm max-w-none mb-4 text-slate-300 leading-loose whitespace-pre-wrap font-serif">
            {turn.story}
          </div>

          {turn.selectedAction && (
            <div className="bg-black/40 p-3 border border-magic-border border-l-4 border-l-magic-pink mb-2">
              <span className="font-bold text-magic-pink text-xs tracking-widest uppercase">
                你的行动
              </span>
              <span className="text-sm text-slate-300 ml-3">
                {turn.selectedAction}
              </span>
            </div>
          )}

          {turn.checkResult && (
            <div className="bg-black/40 p-3 border border-magic-border text-sm text-slate-400 font-mono">
              {turn.checkResult}
            </div>
          )}
        </div>
      ))}
    </div>
    </div>
  );
}
