import { useNavigate, useParams } from 'react-router-dom';
import { useUnitStore } from '../../stores/unitStore';
import { getUnitMaster } from '../../data/units';
import { getSkill } from '../../data/skills';
import { ElementBadge } from '../../components/ui/ElementBadge';
import { RarityBadge } from '../../components/ui/RarityBadge';
import { TopBar } from '../../components/layout/TopBar';
import { formatNumber, calcTotalPower, getExpForLevel } from '../../utils/format';
import { getStarDisplay, getStarColor, getLevelCap, nextRarity, AWAKENING_CONFIG } from '../../data/rarityConfig';
import type { StarRarity } from '../../types';
import { calcUnitStats } from '../../data/units';

export const UnitDetailPage = () => {
  const { instanceId } = useParams<{ instanceId: string }>();
  const navigate = useNavigate();
  const { ownedUnits, toggleLock } = useUnitStore();

  const unit = ownedUnits.find(u => u.instanceId === instanceId);
  if (!unit) return <div className="p-8 text-center text-gray-400">ユニットが見つかりません</div>;

  const master = getUnitMaster(unit.masterId);
  if (!master) return null;

  const skill = getSkill(master.skillId);
  const bbSkill = getSkill(master.bbSkillId);
  const power = calcTotalPower(unit.currentStats);
  const expNeeded = getExpForLevel(unit.level);

  const currentRarity: StarRarity = unit.currentRarity ?? 1;
  const levelCap = getLevelCap(currentRarity);
  const expPct = unit.level >= levelCap ? 100 : (unit.exp / expNeeded) * 100;
  const starColor = getStarColor(currentRarity);
  const awakeningCount = unit.awakeningCount ?? 0;
  const nextRar = nextRarity(currentRarity);

  // 覚醒後のステータスプレビュー (awakeningCount が maxに達していなければ)
  const previewStats = awakeningCount < AWAKENING_CONFIG.maxAwakeningCount
    ? calcUnitStats(master, unit.level, unit.awakenRank, awakeningCount + 1)
    : null;

  return (
    <div className="min-h-screen pb-24" style={{ background: 'radial-gradient(ellipse at 50% 0%, #100820 0%, #08081a 55%)' }}>
      <TopBar onBack={() => navigate('/units')} />

      {/* ヘッダーカード */}
      <div className="px-4 pb-4">
        <div className="rounded-2xl overflow-hidden" style={{
          border: `1px solid ${starColor}44`,
          background: 'rgba(12,8,24,0.9)',
          boxShadow: `0 0 24px ${starColor}22`,
        }}>
          {/* ユニット画像エリア */}
          <div className="h-36 flex items-center justify-center relative"
            style={{ background: elementGradient(master.element) }}>
            <div className="absolute inset-0 opacity-20"
              style={{ background: 'radial-gradient(ellipse at center, white 0%, transparent 70%)' }} />
            {/* 星レアリティ光輪 */}
            <div className="absolute inset-0 opacity-30"
              style={{ background: `radial-gradient(ellipse at center, ${starColor} 0%, transparent 65%)` }} />
            <span className="text-8xl relative z-10">{master.emoji}</span>
            {/* レアリティバッジ */}
            <div className="absolute top-2 left-2 z-20">
              <RarityBadge rarity={currentRarity} size="md" />
            </div>
            {/* ロックボタン */}
            <button
              onClick={() => toggleLock(unit.instanceId)}
              className="absolute top-2 right-2 z-20 text-2xl"
              style={{ color: unit.isLocked ? '#f0c040' : '#4a4a5a' }}
            >
              {unit.isLocked ? '🔒' : '🔓'}
            </button>
          </div>

          <div className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex gap-2 mb-1">
                  <ElementBadge element={master.element} />
                </div>
                <h2 className="text-white font-black text-xl">{master.name}</h2>
                <p className="text-gray-400 text-sm">{master.title}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-xs">戦力</p>
                <p className="font-black text-xl" style={{ color: starColor }}>{formatNumber(power)}</p>
              </div>
            </div>
            <p className="text-gray-500 text-xs mt-2">{master.description}</p>
          </div>
        </div>
      </div>

      {/* レアリティ情報 */}
      <div className="px-4 mb-4">
        <div className="rounded-xl p-4" style={{
          background: `linear-gradient(135deg, ${starColor}18, rgba(12,8,24,0.95))`,
          border: `1px solid ${starColor}33`,
        }}>
          <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: starColor }}>レアリティ情報</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-gray-400 text-xs mb-1">現在レアリティ</p>
              <p className="font-black text-lg" style={{ color: starColor }}>{getStarDisplay(currentRarity)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">レベル上限</p>
              <p className="font-black text-lg text-white">{levelCap}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">次のレアリティ</p>
              <p className="font-black text-lg" style={{ color: nextRar ? getStarColor(nextRar) : '#666' }}>
                {nextRar ? getStarDisplay(nextRar) : '最大'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* レベル */}
      <div className="px-4 mb-4">
        <div className="card-base p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300 font-bold">レベル</span>
            <div className="text-right">
              <span className="text-white font-black text-2xl">{unit.level}</span>
              <span className="text-gray-400 text-sm"> / {levelCap}</span>
            </div>
          </div>
          <div className="w-full h-2 bg-gray-700/60 rounded-full overflow-hidden">
            <div className="h-2 rounded-full transition-all"
              style={{ width: `${expPct}%`, background: `linear-gradient(90deg, ${starColor}99, ${starColor})` }} />
          </div>
          {unit.level < levelCap && (
            <p className="text-xs text-gray-400 mt-1 text-right">EXP: {unit.exp} / {expNeeded}</p>
          )}
          {/* 素材覚醒ランク */}
          {unit.awakenRank > 0 && (
            <div className="mt-2">
              <span className="text-yellow-400 text-sm">
                覚醒ランク: {'★'.repeat(unit.awakenRank)}{'☆'.repeat(Math.max(0, master.maxAwaken - unit.awakenRank))}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ガチャ被り覚醒 */}
      <div className="px-4 mb-4">
        <div className="card-base p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-300 font-bold text-sm">覚醒 (ガチャ被り)</h3>
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{ color: starColor, background: `${starColor}22`, border: `1px solid ${starColor}44` }}>
              {awakeningCount} / {AWAKENING_CONFIG.maxAwakeningCount}
            </span>
          </div>
          {/* 覚醒ドット */}
          <div className="flex gap-2 mb-3">
            {Array.from({ length: AWAKENING_CONFIG.maxAwakeningCount }).map((_, i) => (
              <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black"
                style={{
                  background: i < awakeningCount ? `linear-gradient(135deg, ${starColor}88, ${starColor})` : 'rgba(40,40,60,0.8)',
                  border: `2px solid ${i < awakeningCount ? starColor : '#333'}`,
                  color: i < awakeningCount ? '#fff' : '#555',
                }}>
                {i < awakeningCount ? '★' : '☆'}
              </div>
            ))}
          </div>
          <p className="text-gray-400 text-xs">
            覚醒 +1 ごとに全ステータス +5%（最大 +{AWAKENING_CONFIG.maxAwakeningCount * 5}%）
          </p>
          {awakeningCount > 0 && (
            <p className="text-xs mt-1 font-bold" style={{ color: starColor }}>
              現在のボーナス: +{awakeningCount * 5}%
            </p>
          )}
          {previewStats && awakeningCount < AWAKENING_CONFIG.maxAwakeningCount && (
            <p className="text-gray-500 text-xs mt-1">
              次覚醒後HP: {formatNumber(previewStats.hp)} / ATK: {formatNumber(previewStats.atk)}
            </p>
          )}
        </div>
      </div>

      {/* ステータス */}
      <div className="px-4 mb-4">
        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 px-1">現在ステータス</h3>
        <div className="card-base p-4 grid grid-cols-2 gap-3">
          <StatItem label="HP" value={unit.currentStats.hp} color="text-green-400" barColor="#22c55e" />
          <StatItem label="攻撃力" value={unit.currentStats.atk} color="text-red-400" barColor="#ef4444" />
          <StatItem label="防御力" value={unit.currentStats.def} color="text-blue-400" barColor="#3b82f6" />
          <StatItem label="回復力" value={unit.currentStats.rec} color="text-emerald-400" barColor="#10b981" />
        </div>
      </div>

      {/* スキル */}
      <div className="px-4 mb-4">
        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 px-1">スキル</h3>
        <div className="space-y-2">
          {skill && <SkillCard skill={skill} type="skill" />}
          {bbSkill && <SkillCard skill={bbSkill} type="bb" />}
        </div>
      </div>

      {/* リーダースキル */}
      <div className="px-4 mb-4">
        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 px-1">リーダースキル</h3>
        <div className="card-base p-3" style={{ borderColor: `${starColor}44` }}>
          <p className="text-sm font-bold mb-1" style={{ color: starColor }}>◆ {master.name}のリーダースキル</p>
          <p className="text-gray-300 text-sm">{master.leaderSkillDescription}</p>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="px-4 flex gap-3">
        <button onClick={() => navigate(`/enhance?unit=${instanceId}`)}
          className="flex-1 py-3 rounded-xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #1e3a8a, #4f46e5)' }}>
          強化
        </button>
        {unit.awakenRank < master.maxAwaken && (
          <button onClick={() => navigate(`/enhance?unit=${instanceId}&tab=awaken`)}
            className="flex-1 py-3 rounded-xl text-sm font-bold"
            style={{ background: `linear-gradient(135deg, ${starColor}66, ${starColor})`, color: '#1a0a08' }}>
            素材覚醒
          </button>
        )}
      </div>
    </div>
  );
};

const StatItem = ({ label, value, color, barColor }: { label: string; value: number; color: string; barColor: string }) => (
  <div className="bg-gray-800/60 rounded-lg p-2">
    <p className="text-gray-400 text-xs">{label}</p>
    <p className={`font-black text-lg ${color}`}>{formatNumber(value)}</p>
    <div className="h-1 bg-gray-700/60 rounded-full mt-1 overflow-hidden">
      <div className="h-full rounded-full" style={{ width: '60%', background: barColor, opacity: 0.6 }} />
    </div>
  </div>
);

const SkillCard = ({ skill, type }: { skill: ReturnType<typeof getSkill>; type: 'skill' | 'bb' }) => {
  if (!skill) return null;
  return (
    <div className={`card-base p-3 ${type === 'bb' ? 'border-orange-700/50' : ''}`}>
      <div className="flex items-center gap-2 mb-1">
        {type === 'bb' ? (
          <span className="bg-orange-600 text-white text-xs font-bold px-2 py-0.5 rounded">必殺技</span>
        ) : (
          <span className="bg-blue-700 text-white text-xs font-bold px-2 py-0.5 rounded">スキル</span>
        )}
        <span className="text-white font-bold">{skill.name}</span>
      </div>
      <p className="text-gray-400 text-xs">{skill.description}</p>
      {type === 'bb' && (
        <p className="text-orange-400 text-xs mt-1">BBゲージ: {skill.bbCost}消費</p>
      )}
    </div>
  );
};

const elementGradient = (element: string): string => {
  const map: Record<string, string> = {
    fire: 'linear-gradient(135deg, #7f1d1d, #ef4444)',
    water: 'linear-gradient(135deg, #1e3a5f, #3b82f6)',
    wind: 'linear-gradient(135deg, #064e3b, #10b981)',
    earth: 'linear-gradient(135deg, #451a03, #92400e)',
    light: 'linear-gradient(135deg, #713f12, #ca8a04)',
    dark: 'linear-gradient(135deg, #2e1065, #7c3aed)',
  };
  return map[element] ?? '';
};
