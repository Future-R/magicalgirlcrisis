import React, { useState, useEffect, useRef } from "react";
import { useGameStore } from "../lib/store";
import { generateTurnData, analyzeAction, compressMemory, generateWorldBook } from "../lib/api";
import { rollDice, applyStateChange, cn } from "../lib/utils";
import { ActionOption, Turn } from "../lib/types";
import { Send, RefreshCw, Dice5 } from "lucide-react";

const WORLD_PRESET_1 = `不思议魔法的世界
这宇宙中有九个世界（可能有更多）。在很长一段时间里这九个世界分别独立存在，可以说是互相完全没有干涉过对方。然而，发现了可以前往其他世界方法的世界有两个，一个是“星泰拉魔奇雅”，另外一个是“马尤里伽”。

星泰拉魔奇雅
星泰拉魔奇雅是魔法使的世界。这个世界中被换做九姐妹的9位魔女统治。和认为魔法就是搞乱世界的力量的马尤里伽虽然一直不断有着小型的冲突，但是在某一个时间点便开始了全面战争。
在战争陷入焦灼状态的时候，九姐妹为了打破状态而拿出了名为“业障魔力”的力量。

业障魔力
业障魔力是可以更换因果律，让现实走向想要未来的秘宝。形状虽然都是各种各样的，但是作为代表的形状是以有许多齿轮复杂咬合在一起构造的吊坠形状。
因为业障魔力，星泰拉玛琪雅战胜了马尤里伽。

马尤里伽
马尤里伽是相信宇宙支配者“古神”的宗教世界。被叫做教团的组织统治着。
马尤里伽的祭祀们认为宇宙已经迈入了古神早已定好的命运，只需要达到那里就好了。所以对于他们来说，扰乱因果律的魔法之力是扰乱宇宙法责的东西进而和星泰拉玛琪雅开始对立。
从某一个时间点开始马尤里伽向星泰拉玛琪雅开始了攻击，然而因为业障魔力改变了因果律导致其输给了魔法师们。

九头龙
星泰拉玛琪雅胜利之后，大家都认为和平会到来的时候，突然出现在世界上的巨大怪物袭击了过来。魔物是马尤里伽古神的其中一柱“九头龙”，“落鳞”和“私落子”等眷属也相继出生。
九头龙及其眷属拥有比业障魔力更强的能够改变世界的魔力。于是九头龙吞噬了上述的两个世界，使其湮灭了。

向着地球
星泰拉玛琪雅被消灭的时候，九姐妹们带领着生存者们离开了自己的世界，向着现实世界进行了避难。
然而九头龙下一个目标就是地球（因为九头龙的饕餮特性，就算不来避难，迟早有一天地球也会被其盯上）。在九姐妹带领下，星泰拉玛琪雅的魔法师们为地球张开了结界。虽然防止了九头龙的侵害，但是也缺少能推回去的决定性的力量。
于是，九姐妹们给予了地球上的少女们业障魔力，使其觉醒为魔法少女。

魔法少女
九姐妹们，将业障魔力给予地球的少女。少女们通过业障魔力得到了改写命运的力量，拥有这份力量与威胁世界的敌人战斗的就是魔法少女。
魔法少女的衣服和装备会根据少女内心，又或者说理想·愿望而反映出来。业障魔力会照应初期认可的少女心中的希望之光，在闪亮之中以魔法少女的姿态重新登场。

魔法少女的战斗
九头龙的眷属“落鳞”和“私落子”究竟是以何种形式入侵世界的还尚不明了。然而，祂们会潜入名为“九头龙界”的世界里，创造出一个和现实世界相连的门。
并且不停的扩大九头龙界，最终让九头龙本体出现于世界上。为了阻止九头龙的出现，魔法少女们必须和眷属进行战斗。
同时，如同星泰拉玛琪雅的九姐妹们和幸存者们一样，马尤里伽的幸存者也有一部分逃到了地球。
身为包含九头龙在内的古神的信徒，祂们或许也会是魔法少女应当战斗的敌人吧。

世界的真实
到此为止的情报都是九姐妹们和魔法少女会知道的情报。然而，这个世界也有谁都不知道的事情隐藏其中。

九头龙的真相
实际上，九头龙是宇宙的管理者一样的存在。是修剪让无限延长可能性之枝叶，谋取世界安定化的存在，因此，自其但是变一直盯着所有的进步，监视着通过文明的力量让宇宙的可能性广阔延展的人类。
然而，能够将世界因果律书写覆盖转换的业障魔力的开放，使得宇宙的可能性成倍的扩大。
结果就算九头龙的显现。虽然不知道九头龙是否有自己的一事，然而其目的可以确定是将“由复杂的因果之丝缝合织成的世界全部吞噬掉，并将其化为新的世界”
不过因为结界，九头龙无法靠近，就只能让自己的眷属潜入地球。九头龙的眷属私落子会在地球上形成小小的异世界。从异界中，会有名为落鳞的更小的眷属进入现实世界，夺走人们的可能性。
被夺走可能性的人们并不会知道，而是会“原本有可能做到的事情”无法做到，“可能成为的人”也无法成为。被已经预定好的宿命所囚禁着活下去。
也有可能会被落鳞绑架进入异世界，让世界将其存在的概念抹消掉。
(META上来说，被夺走可能性的人们都会变成所有行动都有GM来独断决定的NPC。而在故事里，本人虽然不会有法术力异常状况的自觉，但会陷入“无论什么都做不好”，“努力也没有用”的抑郁，无气力的状态。）
最终私落子会将收集到的可能性之力扩大异世界，直到现实世界被异世界化。当现实世界被异世界话之后，九头龙便会出现吞噬整个世界。

结束的那一天
星泰拉玛琪雅的幸存者逃到地球的一年后，终于在这个世界显现出本体的九头龙也将这个世界吞噬殆尽了。
即便如此九姐妹们为了让这个世界不被消灭而尝试了一个方法。
那就是，将世界的时间切离的方法。
因为这个魔法，这个世界一直重复着在迎来被吞噬的“结束的那一天”之前的一整年。
直到那个拥有可以创造与改变世界的力量“不思议魔法”的魔女诞生之前将会一直不断地重复下去。

马尤里伽的残党
马尤里伽中也有逃到地球求生的人。
祂们混入地球的人群中，以为了再建马尤里伽或者支配地球为目的而暗中活跃着。
传闻以“人应当将所有的可能性献给神明全般接受自己的命运”为教义的新型邪教团体“迷途孩子之家”是祂们所创建的……`;

export function GameTab() {
  const store = useGameStore();
  const {
    character,
    apiKey,
    history,
    isGenerating,
    setIsGenerating,
    addHistory,
    updateHistory,
    setCharacter,
    saveGame,
    shortTermMemory,
    longTermMemory,
    addShortTermMemory,
    compressMemories,
  } = store;

  const [customAction, setCustomAction] = useState("");
  const [rewritePrompt, setRewritePrompt] = useState("");
  const [showRewrite, setShowRewrite] = useState(false);
  const [rollingDice, setRollingDice] = useState<{ active: boolean; text: string; result?: string } | null>(null);
  const [showSaveLoad, setShowSaveLoad] = useState(false);
  const [saveSlot, setSaveSlot] = useState(1);
  const [loadSlot, setLoadSlot] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);

  const currentTurn = history.length > 0 ? history[history.length - 1] : null;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [history, isGenerating, rollingDice]);

  const handleStart = async () => {
    if (!character || !apiKey)
      return alert("请先确保API Key已配置且角色已创建。");
    setIsGenerating(true);
    try {
      const turnData = await generateTurnData(
        store.systemPrompt,
        store.worldBook,
        character,
        longTermMemory,
        shortTermMemory,
        "",
        "",
        apiKey,
      );

      const newTurn: Turn = {
        id: 1,
        story: turnData.story,
        options: turnData.options || [],
        stateChanges: turnData.state_changes,
      };

      addHistory(newTurn);
      await saveGame(0);
    } catch (e: any) {
      alert("生成失败: " + e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRewrite = async () => {
    if (!currentTurn) return;
    setIsGenerating(true);
    setShowRewrite(false);

    const prevTurn = history.length > 1 ? history[history.length - 2] : null;
    const lastAction = prevTurn?.selectedAction || "";
    const checkResult = prevTurn?.checkResult || "";

    try {
      const turnData = await generateTurnData(
        store.systemPrompt,
        store.worldBook,
        character!,
        longTermMemory,
        shortTermMemory,
        lastAction,
        checkResult,
        apiKey,
        rewritePrompt,
      );

      updateHistory(currentTurn.id, {
        story: turnData.story,
        options: turnData.options || [],
        stateChanges: turnData.state_changes,
      });
      setRewritePrompt("");
      await saveGame(0);
    } catch (e: any) {
      alert("重写失败: " + e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectAction = async (option: ActionOption) => {
    await processAction(option.text, option.attribute, option.difficulty);
  };

  const handleCustomAction = async () => {
    if (!customAction.trim() || !character) return;
    setIsGenerating(true);
    try {
      const analysis = await analyzeAction(customAction, apiKey);
      await processAction(
        customAction,
        analysis.attribute,
        analysis.difficulty,
      );
      setCustomAction("");
    } catch (e: any) {
      alert("动作分析失败: " + e.message);
      setIsGenerating(false);
    }
  };

  const processAction = async (
    actionText: string,
    attributeName: string,
    difficulty: number,
  ) => {
    if (!character || !currentTurn) return;
    setIsGenerating(true);
    try {
      const newChar = applyStateChange(character, currentTurn.stateChanges);
      setCharacter(newChar);
      addShortTermMemory(currentTurn.story);

      let attrVal = 0;
      if (attributeName === "体力" || attributeName.toLowerCase() === "physical") attrVal = newChar.stats.physical;
      if (attributeName === "运动力" || attributeName.toLowerCase() === "agility") attrVal = newChar.stats.agility;
      if (attributeName === "智力" || attributeName.toLowerCase() === "intelligence") attrVal = newChar.stats.intelligence;
      if (attributeName === "魔力" || attributeName.toLowerCase() === "magic") attrVal = newChar.stats.magic;

      const roll = rollDice(attrVal, difficulty);

      setRollingDice({ active: true, text: `正在进行 [${attributeName}] 检定... (难度 ${difficulty})` });
      await new Promise(r => setTimeout(r, 1500));
      setRollingDice({ active: false, text: roll.resultStr, result: roll.success ? "成功" : "失败" });
      await new Promise(r => setTimeout(r, 1500));
      setRollingDice(null);

      updateHistory(currentTurn.id, {
        selectedAction: actionText,
        checkResult: roll.resultStr,
      });

      // 4. Memory compression check
      let currentShortTerm = [...shortTermMemory, currentTurn.story];
      let currentLongTerm = [...longTermMemory];
      if (currentShortTerm.length >= 30) {
        const compressed = await compressMemory(
          currentShortTerm.slice(0, 20),
          apiKey,
        );
        compressMemories(compressed, 20);
        currentShortTerm = currentShortTerm.slice(20);
        currentLongTerm.push(compressed);
      }

      // 5. Generate next turn
      const turnData = await generateTurnData(
        store.systemPrompt,
        store.worldBook,
        newChar,
        currentLongTerm,
        currentShortTerm,
        actionText,
        roll.resultStr,
        apiKey,
      );

      addHistory({
        id: currentTurn.id + 1,
        story: turnData.story,
        options: turnData.options || [],
        stateChanges: turnData.state_changes,
      });

      await saveGame(0);
    } catch (e: any) {
      alert("执行失败: " + e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const [worldPrompt, setWorldPrompt] = useState("");

  if (history.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto w-full p-4 md:p-8">
        <div className="max-w-3xl mx-auto py-12 px-6 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-black text-magic-pink tracking-tight">
            新游戏设置
          </h1>
          <p className="text-slate-400">
            在开始前，请完成世界观和角色设定。
          </p>
        </div>

        <div className="bg-magic-surface p-6 border border-magic-border space-y-4 relative">
          <h2 className="text-xl font-bold text-magic-text border-b border-magic-border pb-2">
            1. 设定世界观
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => store.setWorldBook(WORLD_PRESET_1)}
              className="btn-action px-3 py-1 text-xs"
            >
              预设：不思议魔法的世界
            </button>
          </div>
          <p className="text-sm text-slate-400">你可以手动输入世界观，或者输入几个关键词让AI生成。</p>
          <div className="flex gap-2">
            <input
              value={worldPrompt}
              onChange={(e) => setWorldPrompt(e.target.value)}
              className="flex-1 px-3 py-2 bg-black/40 border border-magic-border focus:border-magic-pink outline-none text-sm text-slate-300"
              placeholder="例如：现代都市，魔法少女隐藏在日常中..."
            />
            <button
              onClick={async () => {
                if (!apiKey) return alert("请先配置 API Key");
                if (!worldPrompt) return alert("请输入提示词");
                setIsGenerating(true);
                try {
                  const res = await generateWorldBook(worldPrompt, apiKey);
                  store.setWorldBook(res);
                } catch(e: any) {
                  alert(e.message);
                }
                setIsGenerating(false);
              }}
              disabled={isGenerating || !apiKey}
              className="btn-action whitespace-nowrap disabled:opacity-50"
            >
              AI 生成
            </button>
          </div>
          <textarea
            value={store.worldBook}
            onChange={(e) => store.setWorldBook(e.target.value)}
            className="w-full h-40 px-3 py-2 bg-black/40 border border-magic-border focus:border-magic-pink outline-none text-sm text-slate-300"
            placeholder="当前世界观设定..."
          />
        </div>

        <div className="bg-magic-surface p-6 border border-magic-border space-y-4 relative">
          <h2 className="text-xl font-bold text-magic-text border-b border-magic-border pb-2">
            2. 创建角色
          </h2>
          {character ? (
            <div className="text-green-500 text-sm">✓ 当前已有角色：{character.name}</div>
          ) : (
            <div className="text-yellow-500 text-sm">⚠ 尚未创建角色，请前往【角色】页签完成创建。</div>
          )}
        </div>

        <button
          onClick={handleStart}
          disabled={isGenerating || !character || !store.worldBook}
          className="w-full py-4 bg-magic-pink hover:bg-pink-600 text-black text-lg font-bold shadow-[0_0_15px_rgba(236,72,153,0.5)] disabled:opacity-50 disabled:shadow-none transition-all"
        >
          {isGenerating ? "生成初始故事中..." : "开始游戏"}
        </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto w-full p-4 md:p-8">
      <div className="max-w-4xl mx-auto pb-32 pt-8">
        {/* 右侧固定工具栏 - 存档读档 */}
        <div className="fixed top-1/4 right-4 z-50 flex flex-col items-end gap-2">
          <button
            onClick={() => setShowSaveLoad(!showSaveLoad)}
            className="bg-black/80 border border-magic-border text-magic-pink px-3 py-2 text-xs hover:border-magic-pink transition-colors shadow-lg shadow-magic-pink/20"
          >
            {showSaveLoad ? "隐藏存档面板" : "存档 / 读档"}
          </button>
      
          {showSaveLoad && (
            <div className="bg-black/90 p-4 border border-magic-border w-64 flex flex-col gap-6 shadow-2xl backdrop-blur-sm">
              <div className="space-y-2">
                <div className="text-sm text-slate-400 border-b border-magic-border/50 pb-1 mb-2">存入档位</div>
                <div className="flex gap-1 flex-wrap">
                  {[1,2,3,4,5].map(i => (
                    <button
                      key={i}
                      onClick={() => setSaveSlot(i)}
                      className={cn("w-8 h-8 text-xs border", saveSlot === i ? "bg-magic-pink text-black border-magic-pink" : "text-slate-500 border-magic-border hover:border-magic-pink bg-black/50")}
                    >
                      {i}
                    </button>
                  ))}
                </div>
                <button onClick={() => { store.saveGame(saveSlot); alert("存档成功！"); }} className="btn-action text-xs py-2 w-full mt-2">保存至 {saveSlot}</button>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-slate-400 border-b border-magic-border/50 pb-1 mb-2">读取档位 <span className="text-[10px]">(0为自动存档)</span></div>
                <div className="flex gap-1 flex-wrap">
                  {[0,1,2,3,4,5].map(i => (
                    <button
                      key={i}
                      onClick={() => setLoadSlot(i)}
                      className={cn("w-8 h-8 text-xs border", loadSlot === i ? "bg-blue-500 text-black border-blue-500" : "text-slate-500 border-magic-border hover:border-blue-500 bg-black/50")}
                    >
                      {i}
                    </button>
                  ))}
                </div>
                <button onClick={async () => { const ok = await store.loadGame(loadSlot); if(ok) alert("读档成功！"); else alert("槽位为空"); }} className="btn-action text-xs py-2 w-full mt-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-black">从 {loadSlot} 读取</button>
              </div>
            </div>
          )}
        </div>

      <div className="space-y-6">
        {history.map((turn, index) => (
          <div
            key={turn.id}
            className={cn(
              "bg-magic-surface p-6 md:p-8 rounded-none border border-magic-border transition-all relative",
              index === history.length - 1
                ? "ring-1 ring-magic-pink"
                : "opacity-80",
            )}
          >
            <div className="prose prose-sm md:prose-base max-w-none text-slate-300 leading-relaxed whitespace-pre-wrap font-serif">
              {turn.story}
            </div>

            {turn.selectedAction && (
              <div className="mt-6 bg-black/40 rounded-none p-4 border border-magic-border">
                <div className="flex items-center gap-2 text-magic-text font-medium mb-2">
                  <div className="w-2 h-2 bg-magic-pink rounded-full"></div>
                  {turn.selectedAction}
                </div>
                {turn.checkResult && (
                  <div className="text-sm font-mono text-slate-400 flex items-center gap-2">
                    <Dice5 size={16} />
                    {turn.checkResult}
                  </div>
                )}
              </div>
            )}

            {index === history.length - 1 && !turn.selectedAction && !rollingDice && (
              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-400 tracking-wider">
                    推荐行动
                  </h3>
                  <button
                    onClick={() => setShowRewrite(!showRewrite)}
                    className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1"
                  >
                    <RefreshCw size={12} />
                    不满意？重写本段
                  </button>
                </div>

                {showRewrite && (
                  <div className="bg-black/40 p-3 flex gap-2 border border-magic-border">
                    <input
                      value={rewritePrompt}
                      onChange={(e) => setRewritePrompt(e.target.value)}
                      placeholder="选填：重写方向或提示词..."
                      className="flex-1 bg-transparent border border-magic-border px-3 py-2 text-sm outline-none focus:border-magic-pink text-slate-300"
                    />
                    <button
                      onClick={handleRewrite}
                      disabled={isGenerating}
                      className="px-4 py-2 bg-magic-pink text-black text-sm disabled:opacity-50 hover:bg-pink-600 font-bold"
                    >
                      执行重写
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {turn.options?.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectAction(opt)}
                      disabled={isGenerating}
                      className="text-left p-4 border border-magic-border hover:border-magic-pink hover:bg-black/40 transition-all disabled:opacity-50 bg-magic-surface group"
                    >
                      <div className="text-sm text-slate-300 mb-2">
                        {opt.text}
                      </div>
                      <div className="flex justify-between items-center text-xs font-mono text-slate-500 group-hover:text-magic-pink">
                        <span>[{opt.attribute}]</span>
                        <span>难度 {opt.difficulty}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="relative mt-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-magic-border"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-magic-surface px-2 text-slate-500">
                      或者手动输入行动
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    value={customAction}
                    onChange={(e) => setCustomAction(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCustomAction()}
                    placeholder="描述你的行动..."
                    disabled={isGenerating}
                    className="flex-1 px-4 py-3 bg-black/40 border border-magic-border outline-none focus:border-magic-pink text-sm disabled:opacity-50 text-slate-300"
                  />
                  <button
                    onClick={handleCustomAction}
                    disabled={!customAction.trim() || isGenerating}
                    className="px-6 py-3 bg-magic-pink hover:bg-pink-600 text-black disabled:opacity-50 flex items-center gap-2"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            )}
            
            {index === history.length - 1 && rollingDice && (
              <div className="mt-8 p-6 bg-black/40 border border-magic-pink flex flex-col items-center justify-center space-y-4">
                <Dice5 size={32} className={cn("text-magic-pink", rollingDice.active && "animate-spin")} />
                <div className="text-slate-300 font-mono text-center">
                  {rollingDice.text}
                </div>
                {rollingDice.result && (
                  <div className={cn("text-xl font-bold tracking-widest", rollingDice.result === "成功" ? "text-green-500" : "text-red-500")}>
                    {rollingDice.result}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {isGenerating && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-pulse">
          <RefreshCw size={18} className="animate-spin" />
          <span className="text-sm font-medium tracking-wide">
            正在编制命运……
          </span>
        </div>
      )}
    </div>
    </div>
  );
}
