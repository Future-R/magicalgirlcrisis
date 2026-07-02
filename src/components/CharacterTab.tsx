import React, { useState } from "react";
import { useGameStore } from "../lib/store";
import { generateCharacter } from "../lib/api";
import { Character } from "../lib/types";
import { CHARACTER_CREATION_RULES } from "../lib/rules";
import { saveAs } from "file-saver";
import { Plus, X } from "lucide-react";

function ArrayEditor({
  label,
  items = [],
  onChange,
  options = [],
}: {
  label: string;
  items: string[];
  onChange: (newItems: string[]) => void;
  options?: { name: string; description?: string }[];
}) {
  const [inputValue, setInputValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredOptions = options.filter(
    (opt) =>
      opt.name.toLowerCase().includes(inputValue.toLowerCase()) &&
      !items.includes(opt.name)
  );

  const handleAdd = (value: string) => {
    if (value.trim() && !items.includes(value.trim())) {
      onChange([...items, value.trim()]);
    }
    setInputValue("");
    setShowDropdown(false);
  };

  const handleRemove = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    onChange(newItems);
  };

  return (
    <div className="space-y-2">
      <label className="text-xs text-slate-500 uppercase tracking-widest">
        {label}
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-1 bg-magic-surface border border-magic-border px-2 py-1 text-xs text-magic-text group relative"
          >
            <span>{item}</span>
            <button
              onClick={() => handleRemove(index)}
              className="text-slate-500 hover:text-red-400 focus:outline-none"
            >
              <X size={12} />
            </button>
            {/* Find description if available */}
            {options.find((o) => o.name === item)?.description && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-64 p-2 bg-black border border-magic-border text-xs text-slate-300 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 pointer-events-none">
                {options.find((o) => o.name === item)?.description}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="relative">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            className="flex-1 bg-black/40 border border-magic-border px-3 py-2 text-white text-sm outline-none focus:border-magic-pink"
            placeholder="输入或选择..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd(inputValue);
              }
            }}
          />
          <button
            onClick={() => handleAdd(inputValue)}
            className="btn-action text-xs px-3"
            type="button"
          >
            <Plus size={16} />
          </button>
        </div>
        {showDropdown && filteredOptions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-magic-surface border border-magic-border shadow-xl z-20">
            {filteredOptions.map((opt, i) => (
              <div
                key={i}
                onMouseDown={(e) => { e.preventDefault(); handleAdd(opt.name); }}
                className="px-3 py-2 hover:bg-magic-pink/20 cursor-pointer border-b border-magic-border/30 last:border-0 group"
              >
                <div className="text-sm text-magic-pink">{opt.name}</div>
                {opt.description && (
                  <div className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {opt.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function CharacterTab() {
  const { character, setCharacter, apiKey, isGenerating, setIsGenerating } =
    useGameStore();
  const [prompt, setPrompt] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editChar, setEditChar] = useState<Character | null>(null);

  const handleGenerate = async () => {
    if (!apiKey) return alert("请先在设置中填写API KEY");
    if (!prompt.trim()) return alert("请输入角色设定提示词");
    setIsGenerating(true);
    try {
      const char = await generateCharacter(prompt, apiKey);
      setCharacter(char);
    } catch (e: any) {
      alert("生成失败: " + e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportChar = () => {
    if (!character) return alert("没有可导出的角色");
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
          alert("导入成功");
        } catch (err) {
          alert("解析角色文件失败");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleEdit = () => {
    setEditChar(JSON.parse(JSON.stringify(character))); // clone
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editChar) {
      setCharacter(editChar);
      setIsEditing(false);
    }
  };

  const CHARACTER_PRESET_1: Character = {
    name: "索拉·哈雷瓦塔尔",
    age: 14,
    level: 1,
    stats: { physical: 6, agility: 6, intelligence: 2, magic: 2 },
    attributes: { physical: 6, magic: 2 },
    derivedStats: {
      hp: 40,
      maxHp: 40,
      mp: 20,
      maxMp: 20,
      cp: 0,
      iv: 0,
      sp: { chest: 0, waist: 0, hip: 0, mouth: 0, pain: 0, mind: 0 },
      ap: { chest: 0, waist: 0 }
    },
    skills: ["跑酷", "格斗技"],
    spells: [],
    crisisAbilities: ["《无敌 Invincible》"],
    equipment: ["运动服", "英雄围巾"],
    goals: ["等级3-思慕:成为英雄"],
    crisisActions: [
      "<卡进去的布料>",
      "<湿透>",
      "<秘密花园>",
      "<太小的胸部>",
      "<魅惑的曲线>",
      "<无垢的纯情>",
      "<羞耻的谩骂>",
      "<视奸的囚笼>",
      "<抓住肉桃的手>",
      "<赤红的鲜血>"
    ],
    identityTrait: "天空王国女孩",
    physicalTrait: "最强的健康优良儿",
    personalityTrait: "活力满满，善良勇敢但易紧绷",
    background: "为了成为小时候从危机中拯救出来的像憧憬的人一样的英雄，认真地拼命地每天锻炼中。身手敏捷，体能超群，自从十年前被夏拉拉队长救下后就开始不停的锻炼，实力强到能够轻松在建筑物间跑酷，变身之前的力量就足够将身型健壮 of 卡巴顿击倒，甚至不变身就能一拳碎石，后续威力越发越强大，进入学校后以相当优异的成绩破掉多个体育记录，被同学称为“最强的健康优良儿”，一旦请假就会引发惊慌。但唯独不会游泳。从小就在思考“怎样成为英雄”而完全没考虑除这以外的其他事，也不在意打扮，去服装店选衣服时也只在意运动服，审美略差，实际上也是个穿什么都好看的女孩子，而且和普通女孩子一样，一旦尝试了也会乐在其中。面对灵异事件相当苦手，也很害怕这一类的东西。每天活力满满，像个太阳一样照耀着身边的朋友们，有着即使害怕也要保护他人的善良与勇气。看到有人遇到危险就会奋不顾身的帮忙，哪怕是敌人遇到危险也会下意识地冲上去帮助对方，但为了保护重要之事容易过于神经紧绷，常常给自己带来无形的心理负担。"
  };

  const CHARACTER_PRESET_2: Character = {
    name: "橘未来",
    age: 16,
    level: 2,
    stats: { physical: 6, agility: 6, intelligence: 0, magic: 2 },
    attributes: { physical: 10, magic: 1 },
    derivedStats: {
      hp: 49,
      maxHp: 49,
      mp: 3,
      maxMp: 3,
      cp: 0,
      iv: 8,
      sp: { chest: 1, waist: 1, hip: 0, mouth: 1, pain: 0, mind: 6 },
      ap: { chest: 12, waist: 10 }
    },
    skills: [],
    spells: ["《攻击手 Attacker》", "《迅捷 Speedster》", "《重击 Critical Hit》", "《坚强的心 Strong Heart》", "《强运 Lucky Hit》"],
    crisisAbilities: ["《潜力 Potential》", "《无敌 Invincible》"],
    equipment: ["穿着", "大型武器", "长手套", "力量手环", "翼靴", "翅膀"],
    goals: ["等级3-思慕:保护同伴"],
    crisisActions: ["<后方的处女>", "<被灌注的种子>", "<劣等感：胯>", "<屈服的失禁>", "<淫乱的紧缚>", "<强制高潮>", "<失禁>", "<纯洁之证>", "<产卵>", "<秘密花园>"],
    identityTrait: "学生不良",
    physicalTrait: "中性平胸",
    personalityTrait: "自我中心",
    background: "外貌描述：头发：橙色长双马尾，做爱时可以当把手。武器：碎心者(HeartBreaker)，一柄巨大的战锤。锤头是巨大的橙色心形水晶。锤柄是银白色的金属材质，上面缠绕着黑色的防滑绑带。光是锤头的水晶就快比使用者还大了。上衣：外层是铆钉露脐夹克，内层是半透明黑色紧身衣包覆了肌肤。内衣是乳贴。下衣：黑色百褶短裙，左侧有开叉方便运动。有轻薄的白色安全裤。足部：有羽翼的短靴、看不到的短棉袜。\n个人描述：爱好：格斗游戏、打鼓、踹人、在户外睡午觉、收集创可贴。讨厌：学习、鬼故事（老子才不怕）。发色：从发根勉强可以看出原本是金发，但染成了亮红色。发型：乱糟糟的短发，但脑后留了一束及臀的细马尾。瞳色：琥珀色。校服：略显宽松邋遢，常把格子外套系在腰间，虽然不在意走光但总穿最长的裙子。性格：在表达感情方面不是很坦率。高自尊，言辞粗鄙，看起来有点任性和粗鲁，大大咧咧。凡事都想用力量解决。口头禅：总之，狠狠揍一顿就行了对吧\n背景故事：在一次意外中，自己眼睁睁见到自己的朋友死亡，因此痛恨自己的无力。现在有了魔法少女的力量，她绝不会再让这种事发生。"
  };

  if (!character) {
    return (
      <div className="flex-1 overflow-y-auto w-full p-4 md:p-8">
      <div className="max-w-2xl mx-auto p-8 border border-magic-border bg-magic-surface relative group">
        <h2 className="text-2xl font-bold mb-4 text-magic-text tracking-widest uppercase">
          创建角色
        </h2>
        <p className="text-slate-400 mb-6 text-sm">
          当前没有角色。您可以手写设定让模型帮您生成，或直接在设置页面导入角色卡。
        </p>
        <div className="mb-6 flex gap-2 flex-wrap">
          <button
            onClick={() => setCharacter(CHARACTER_PRESET_1)}
            className="btn-action text-xs px-3 py-1 mb-2"
          >
            预设角色：索拉·哈雷瓦塔尔
          </button>
          <button
            onClick={() => setCharacter(CHARACTER_PRESET_2)}
            className="btn-action text-xs px-3 py-1 mb-2"
          >
            预设角色：橘未来
          </button>
        </div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="例如：一个因为家道中落而成为魔法少女的高中生，性格软弱但为了保护妹妹而坚强。擅长使用水系魔法，身材娇小。"
          className="w-full h-32 p-3 bg-black/40 border border-magic-border outline-none focus:border-magic-pink text-white mb-6 text-sm"
        />
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full btn-action mb-4"
        >
          {isGenerating ? "生成中..." : "使用模型生成角色"}
        </button>

        <div className="flex gap-4">
          <label className="flex-1 btn-action cursor-pointer flex items-center justify-center text-xs">
            导入角色卡 (.json)
            <input
              type="file"
              className="hidden"
              accept=".json"
              onChange={handleImportChar}
            />
          </label>
        </div>
      </div>
      </div>
    );
  }

  if (isEditing && editChar) {
    return (
      <div className="flex-1 overflow-y-auto w-full p-4 md:p-8 flex flex-col h-full">
        <div className="max-w-4xl mx-auto space-y-4 pb-12 flex flex-col flex-1 w-full">
          <div className="flex justify-between items-center bg-magic-surface p-4 border border-magic-border">
            <h2 className="text-xl font-bold text-magic-pink tracking-widest uppercase">
              编辑角色卡
            </h2>
            <div className="flex gap-2">
              <button onClick={() => setIsEditing(false)} className="btn-action text-xs px-3 py-1">
                取消
              </button>
              <button onClick={handleSaveEdit} className="btn-action text-xs px-3 py-1">
                保存
              </button>
            </div>
          </div>
          
          <div className="bg-magic-surface border border-magic-border p-6 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-500 uppercase tracking-widest">名字</label>
                <input
                  value={editChar.name}
                  onChange={(e) => setEditChar({ ...editChar, name: e.target.value })}
                  className="w-full bg-black/40 border border-magic-border px-3 py-2 text-white text-sm outline-none focus:border-magic-pink"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-500 uppercase tracking-widest">年龄</label>
                <input
                  type="number"
                  value={editChar.age !== undefined ? editChar.age : 14}
                  onChange={(e) => setEditChar({ ...editChar, age: parseInt(e.target.value) || 14 })}
                  className="w-full bg-black/40 border border-magic-border px-3 py-2 text-white text-sm outline-none focus:border-magic-pink"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-500 uppercase tracking-widest">等级</label>
                <input
                  type="number"
                  value={editChar.level}
                  onChange={(e) => setEditChar({ ...editChar, level: parseInt(e.target.value) || 1 })}
                  className="w-full bg-black/40 border border-magic-border px-3 py-2 text-white text-sm outline-none focus:border-magic-pink"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-magic-pink uppercase tracking-widest border-b border-magic-border pb-2">基础能力</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries({ physical: "体力", agility: "运动力", intelligence: "智力", magic: "魔力" }).map(([key, label]) => (
                    <div key={key} className="space-y-1">
                      <label className="text-xs text-slate-500 uppercase tracking-widest">{label}</label>
                      <input
                        type="number"
                        value={editChar.stats[key as keyof typeof editChar.stats]}
                        onChange={(e) => setEditChar({ ...editChar, stats: { ...editChar.stats, [key]: parseInt(e.target.value) || 0 } })}
                        className="w-full bg-black/40 border border-magic-border px-3 py-2 text-white text-sm outline-none focus:border-magic-pink"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-magic-pink uppercase tracking-widest border-b border-magic-border pb-2">属性</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries({ physical: "物理属性", magic: "魔法属性" }).map(([key, label]) => (
                    <div key={key} className="space-y-1">
                      <label className="text-xs text-slate-500 uppercase tracking-widest">{label}</label>
                      <input
                        type="number"
                        value={editChar.attributes[key as keyof typeof editChar.attributes]}
                        onChange={(e) => setEditChar({ ...editChar, attributes: { ...editChar.attributes, [key]: parseInt(e.target.value) || 0 } })}
                        className="w-full bg-black/40 border border-magic-border px-3 py-2 text-white text-sm outline-none focus:border-magic-pink"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-sm font-bold text-magic-pink uppercase tracking-widest border-b border-magic-border pb-2">特征与背景</h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 uppercase tracking-widest">身份</label>
                    <input
                      value={editChar.identityTrait}
                      onChange={(e) => setEditChar({ ...editChar, identityTrait: e.target.value })}
                      className="w-full bg-black/40 border border-magic-border px-3 py-2 text-white text-sm outline-none focus:border-magic-pink"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 uppercase tracking-widest">身体</label>
                    <input
                      value={editChar.physicalTrait}
                      onChange={(e) => setEditChar({ ...editChar, physicalTrait: e.target.value })}
                      className="w-full bg-black/40 border border-magic-border px-3 py-2 text-white text-sm outline-none focus:border-magic-pink"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 uppercase tracking-widest">性格</label>
                    <input
                      value={editChar.personalityTrait}
                      onChange={(e) => setEditChar({ ...editChar, personalityTrait: e.target.value })}
                      className="w-full bg-black/40 border border-magic-border px-3 py-2 text-white text-sm outline-none focus:border-magic-pink"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 uppercase tracking-widest">背景设定</label>
                    <textarea
                      value={editChar.background}
                      onChange={(e) => setEditChar({ ...editChar, background: e.target.value })}
                      className="w-full h-24 bg-black/40 border border-magic-border px-3 py-2 text-white text-sm outline-none focus:border-magic-pink"
                    />
                  </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ArrayEditor
                label="技能"
                items={editChar.skills || []}
                onChange={(skills) => setEditChar({ ...editChar, skills })}
              />
              <ArrayEditor
                label="魔法"
                items={editChar.spells || []}
                onChange={(spells) => setEditChar({ ...editChar, spells })}
                options={CHARACTER_CREATION_RULES.魔法.map((r) => ({
                  name: r.名称,
                  description: r.效果,
                }))}
              />
              <ArrayEditor
                label="危机技能"
                items={editChar.crisisAbilities || []}
                onChange={(crisisAbilities) => setEditChar({ ...editChar, crisisAbilities })}
                options={CHARACTER_CREATION_RULES.危机技能.map((r) => ({
                  name: r.名称,
                  description: `CP: ${r.CP} | ${r.效果}`,
                }))}
              />
              <ArrayEditor
                label="装备"
                items={editChar.equipment || []}
                onChange={(equipment) => setEditChar({ ...editChar, equipment })}
                options={CHARACTER_CREATION_RULES.装备和饰品.map((r) => ({
                  name: r.名称,
                  description: `${r.类型} | 消耗: ${r.消耗} ${r.解说和特殊效果 ? '| ' + r.解说和特殊效果 : ''}`,
                }))}
              />
              <ArrayEditor
                label="目标"
                items={editChar.goals || []}
                onChange={(goals) => setEditChar({ ...editChar, goals })}
              />
              <div className="md:col-span-2">
                <ArrayEditor
                  label="危机动作"
                  items={editChar.crisisActions || []}
                  onChange={(crisisActions) => setEditChar({ ...editChar, crisisActions })}
                  options={CHARACTER_CREATION_RULES.危机动作.map((r) => ({
                    name: r.名称,
                    description: `获得CP: ${r.获得CP} | 获得SP: ${r.获得SP} | 持有: ${r.持有条件} | 使用: ${r.使用条件} | ${r.描述}`,
                  }))}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto w-full p-4 md:p-8">
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="bg-magic-surface p-6 border border-magic-border flex justify-between items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-magic-pink/5 blur-[50px] rounded-full pointer-events-none"></div>
        <h1 className="text-3xl font-black text-magic-pink tracking-widest uppercase">
          {character.name}
        </h1>
        <div className="flex items-center gap-2">
          <div className="text-sm text-slate-500 font-mono tracking-widest mr-2">
            年龄 {character.age !== undefined ? character.age : 14} 岁 | 等级 {Number(character.level) || 1}
          </div>
          <button onClick={handleExportChar} className="btn-action text-xs px-3 py-1.5 hidden md:block">导出</button>
          <label className="btn-action cursor-pointer text-xs px-3 py-1.5 flex items-center justify-center hidden md:block">
            导入
            <input type="file" className="hidden" accept=".json" onChange={handleImportChar} />
          </label>
          <button onClick={handleEdit} className="btn-action text-xs px-3 py-1.5">编辑</button>
          <button onClick={() => setCharacter(null)} className="btn-action text-xs px-3 py-1.5 text-red-400 hover:text-red-300">重新创建</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="bg-magic-surface p-5 border border-magic-border relative">
            <h3 className="font-bold text-slate-300 mb-4 tracking-widest text-sm uppercase">
              特征
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex flex-col gap-1">
                <span className="text-slate-500 text-xs">年龄</span>{" "}
                <span className="text-white">{character.age !== undefined ? character.age : 14} 岁</span>
              </li>
              <li className="flex flex-col gap-1">
                <span className="text-slate-500 text-xs">身份</span>{" "}
                <span className="text-white">{character.identityTrait}</span>
              </li>
              <li className="flex flex-col gap-1">
                <span className="text-slate-500 text-xs">身体</span>{" "}
                <span className="text-white">{character.physicalTrait}</span>
              </li>
              <li className="flex flex-col gap-1">
                <span className="text-slate-500 text-xs">性格</span>{" "}
                <span className="text-white">{character.personalityTrait}</span>
              </li>
            </ul>
          </div>

          <div className="bg-magic-surface p-5 border border-magic-border relative">
            <h3 className="font-bold text-slate-300 mb-4 tracking-widest text-sm uppercase">
              基础能力
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-black/40 border border-magic-border p-3 flex flex-col items-center justify-center">
                <div className="text-slate-500 text-[10px] tracking-wider mb-1">
                  体力
                </div>
                <div className="text-xl font-bold text-white">
                  {character.stats?.physical || 0}
                </div>
              </div>
              <div className="bg-black/40 border border-magic-border p-3 flex flex-col items-center justify-center">
                <div className="text-slate-500 text-[10px] tracking-wider mb-1">
                  运动力
                </div>
                <div className="text-xl font-bold text-white">
                  {character.stats?.agility || 0}
                </div>
              </div>
              <div className="bg-black/40 border border-magic-border p-3 flex flex-col items-center justify-center">
                <div className="text-slate-500 text-[10px] tracking-wider mb-1">
                  智力
                </div>
                <div className="text-xl font-bold text-white">
                  {character.stats?.intelligence || 0}
                </div>
              </div>
              <div className="bg-black/40 border border-magic-border p-3 flex flex-col items-center justify-center">
                <div className="text-slate-500 text-[10px] tracking-wider mb-1">
                  魔力
                </div>
                <div className="text-xl font-bold text-white">
                  {character.stats?.magic || 0}
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-magic-border flex justify-between text-xs text-slate-400">
              <div className="flex gap-2 items-center">
                <span>物理属性</span>
                <span className="text-white font-mono text-sm">
                  {character.attributes?.physical || 0}
                </span>
              </div>
              <div className="flex gap-2 items-center">
                <span>魔法属性</span>
                <span className="text-white font-mono text-sm">
                  {character.attributes?.magic || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-magic-surface p-5 border border-magic-border relative">
            <h3 className="font-bold text-slate-300 mb-4 tracking-widest text-sm uppercase">
              衍生数值
            </h3>
            <ul className="space-y-3 text-sm font-mono tracking-wider">
              <li className="flex justify-between items-center border-b border-magic-border/50 pb-2">
                <span className="text-slate-500">HP</span>
                <div>
                  <span className="text-red-400">
                    {Number(character.derivedStats?.hp) || 0}
                  </span>
                  <span className="text-slate-600 mx-1">/</span>
                  <span className="text-slate-400">
                    {Number(character.derivedStats?.maxHp) || 0}
                  </span>
                </div>
              </li>
              <li className="flex justify-between items-center border-b border-magic-border/50 pb-2">
                <span className="text-slate-500">MP</span>
                <div>
                  <span className="text-blue-400">
                    {Number(character.derivedStats?.mp) || 0}
                  </span>
                  <span className="text-slate-600 mx-1">/</span>
                  <span className="text-slate-400">
                    {Number(character.derivedStats?.maxMp) || 0}
                  </span>
                </div>
              </li>
              <li className="flex justify-between items-center border-b border-magic-border/50 pb-2">
                <span className="text-slate-500">CP</span>
                <span className="text-orange-400">
                  {Number(character.derivedStats?.cp) || 0}
                </span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-slate-500">IV</span>
                <span className="text-green-400">
                  {Number(character.derivedStats?.iv) || 0}
                </span>
              </li>
            </ul>

            <div className="mt-6">
              <h4 className="text-[10px] text-slate-500 tracking-widest uppercase mb-2">
                护甲 (AP)
              </h4>
              <div className="flex gap-4 text-xs font-mono text-slate-300">
                <div className="bg-black/40 border border-magic-border px-3 py-1.5 flex-1 text-center flex justify-between">
                  <span>胸</span>
                  <span>{Number(character.derivedStats?.ap?.chest) || 0}</span>
                </div>
                <div className="bg-black/40 border border-magic-border px-3 py-1.5 flex-1 text-center flex justify-between">
                  <span>腰</span>
                  <span>{Number(character.derivedStats?.ap?.waist) || 0}</span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-[10px] text-slate-500 tracking-widest uppercase mb-2">
                开发度 (SP)
              </h4>
              <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-magic-pink">
                <div className="border border-magic-pink/30 bg-magic-pink/5 p-1.5 flex flex-col items-center gap-1">
                  <span className="text-slate-500">胸</span>
                  <span>{Number(character.derivedStats?.sp?.chest) || 0}</span>
                </div>
                <div className="border border-magic-pink/30 bg-magic-pink/5 p-1.5 flex flex-col items-center gap-1">
                  <span className="text-slate-500">腰</span>
                  <span>{Number(character.derivedStats?.sp?.waist) || 0}</span>
                </div>
                <div className="border border-magic-pink/30 bg-magic-pink/5 p-1.5 flex flex-col items-center gap-1">
                  <span className="text-slate-500">尻</span>
                  <span>{Number(character.derivedStats?.sp?.hip) || 0}</span>
                </div>
                <div className="border border-magic-pink/30 bg-magic-pink/5 p-1.5 flex flex-col items-center gap-1">
                  <span className="text-slate-500">口</span>
                  <span>{Number(character.derivedStats?.sp?.mouth) || 0}</span>
                </div>
                <div className="border border-magic-pink/30 bg-magic-pink/5 p-1.5 flex flex-col items-center gap-1">
                  <span className="text-slate-500">痛</span>
                  <span>{Number(character.derivedStats?.sp?.pain) || 0}</span>
                </div>
                <div className="border border-magic-pink/30 bg-magic-pink/5 p-1.5 flex flex-col items-center gap-1">
                  <span className="text-slate-500">心</span>
                  <span>{Number(character.derivedStats?.sp?.mind) || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-magic-surface p-6 border border-magic-border relative">
            <h3 className="font-bold text-slate-300 mb-4 tracking-widest text-sm uppercase">
              背景故事
            </h3>
            <p className="text-sm text-slate-300 leading-loose whitespace-pre-wrap font-serif">
              {character.background}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-magic-surface p-5 border border-magic-border">
              <h3 className="font-bold text-slate-300 mb-4 tracking-widest text-xs uppercase border-b border-magic-border pb-2">
                魔法
              </h3>
              <ul className="text-sm space-y-2 text-slate-400">
                {character.spells?.map((s, i) => (
                  <li key={i} className="flex gap-2 items-start">
                    <span className="text-magic-pink mt-1 text-[10px]">■</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-magic-surface p-5 border border-magic-border">
              <h3 className="font-bold text-slate-300 mb-4 tracking-widest text-xs uppercase border-b border-magic-border pb-2">
                危机技能
              </h3>
              <ul className="text-sm space-y-2 text-slate-400">
                {character.crisisAbilities?.map((c, i) => (
                  <li key={i} className="flex gap-2 items-start">
                    <span className="text-orange-500 mt-1 text-[10px]">■</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-magic-surface p-5 border border-magic-border">
              <h3 className="font-bold text-slate-300 mb-4 tracking-widest text-xs uppercase border-b border-magic-border pb-2">
                目标
              </h3>
              <ul className="text-sm space-y-2 text-slate-400">
                {character.goals?.map((g, i) => (
                  <li key={i} className="flex gap-2 items-start">
                    <span className="text-green-500 mt-1 text-[10px]">■</span>
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-magic-surface p-5 border border-magic-border">
              <h3 className="font-bold text-slate-300 mb-4 tracking-widest text-xs uppercase border-b border-magic-border pb-2">
                装备
              </h3>
              <ul className="text-sm space-y-2 text-slate-400">
                {character.equipment?.map((e, i) => (
                  <li key={i} className="flex gap-2 items-start">
                    <span className="text-blue-500 mt-1 text-[10px]">■</span>
                    <span>{e}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-magic-surface p-5 border border-magic-border">
            <h3 className="font-bold text-slate-300 mb-4 tracking-widest text-xs uppercase border-b border-magic-border pb-2">
              危机动作
            </h3>
            <div className="flex flex-wrap gap-2">
              {character.crisisActions?.map((ca, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 border border-slate-700 bg-black/40 text-xs text-slate-300 tracking-wider"
                >
                  {ca}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
