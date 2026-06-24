import { useNavigate, useParams } from 'react-router-dom';
import { useUnitStore } from '../../stores/unitStore';
import { UNIT_MASTER } from '../../data/units';
import { getSkill } from '../../data/skills';
import { ElementBadge } from '../../components/ui/ElementBadge';
import { RarityBadge } from '../../components/ui/RarityBadge';
import { TopBar } from '../../components/layout/TopBar';
import { formatNumber, calcTotalPower, getExpForLevel } from '../../utils/format';

export const UnitDetailPage = () => {
  const { instanceId } = useParams<{ instanceId: string }>();
  const navigate = useNavigate();
  const { ownedUnits, toggleLock } = useUnitStore();

  const unit = ownedUnits.find(u => u.instanceId === instanceId);
  if (!unit) return <div className="p-8 text-center text-gray-400">ユニットが見つかりません</div>;

  const master = UNIT_MASTER.find(m => m.id === unit.masterId);
  if (!master) return null;

  const skill = getSkill(master.skillId);
  const bbSkill = getSkill(master.bbSkillId);
  const power = calcTotalPower(unit.currentStats);
  const expNeeded = getExpForLevel(unit.level);
  const expPct = unit.level >= master.maxLevel ? 100 : (unit.exp / expNeeded) * 100;

  return (
    <div className="min-h-screen pb-24">
      <TopBar onBack={() => navigate('/units')} />

      {/* ヘッダー */}
      <div className="px-4 pb-4">
        <div className="card-base overflow-hidden">
          <div className="h-32 flex items-center justify-center relative"
            style={{ background: elementGradient(master.element) }}>
            <div className="absolute inset-0 opacity-20"
              style={{ background: 'radial-gradient(ellipse at center, white 0%, transparent 70%)' }} />
            <span className="text-7xl relative z-10">{master.emoji}</span>
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex gap-2 mb-1">
                  <RarityBadge rarity={master.rarity} />
                  <ElementBadge element={master.element} />
                </div>
                <h2 className="text-white font-black text-xl">{master.name}</h2>
                <p className="text-gray-400 text-sm">{master.title}</p>
              </div>
              <div className="text-right">
                <button
                  onClick={() => toggleLock(unit.instanceId)}
                  className={`text-2xl mb-1 ${unit.isLocked ? 'text-yellow-400' : 'text-gray-600'}`}
                >
                  {unit.isLocked ? '🔒' : '🔓'}
                </button>
                <p className="text-gray-400 text-xs">戦力</p>
                <p className="text-yellow-400 font-black text-xl">{formatNumber(power)}</p>
              </div>
            </div>
            <p className="text-gray-400 text-xs mt-2">{master.description}</p>
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
              <span className="text-gray-400 text-sm"> / {master.maxLevel}</span>
            </div>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
              style={{ width: `${expPct}%` }} />
          </div>
          {unit.level < master.maxLevel && (
            <p className="text-xs text-gray-400 mt-1 text-right">EXP: {unit.exp} / {expNeeded}</p>
          )}
          {unit.awakenRank > 0 && (
            <div className="mt-2">
              <span className="text-yellow-400 text-sm">覚醒ランク: {'★'.repeat(unit.awakenRank)}{'☆'.repeat(master.maxAwaken - unit.awakenRank)}</span>
            </div>
          )}
        </div>
      </div>

      {/* ステータス */}
      <div className="px-4 mb-4">
        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 px-1">ステータス</h3>
        <div className="card-base p-4 grid grid-cols-2 gap-3">
          <StatItem label="HP" value={unit.currentStats.hp} icon="❤️" color="text-green-400" />
          <StatItem label="攻撃力" value={unit.currentStats.atk} icon="⚔️" color="text-red-400" />
          <StatItem label="防御力" value={unit.currentStats.def} icon="🛡️" color="text-blue-400" />
          <StatItem label="回復力" value={unit.currentStats.rec} icon="💚" color="text-emerald-400" />
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
        <div className="card-base p-3 border-yellow-700/40">
          <p className="text-yellow-400 text-sm font-bold mb-1">👑 {master.name}のリーダースキル</p>
          <p className="text-gray-300 text-sm">{master.leaderSkillDescription}</p>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="px-4 flex gap-3">
        <button onClick={() => navigate(`/enhance?unit=${instanceId}`)} className="btn-primary flex-1 text-sm">
          ⬆️ 強化
        </button>
        {unit.awakenRank < master.maxAwaken && (
          <button onClick={() => navigate(`/enhance?unit=${instanceId}&tab=awaken`)} className="btn-gold flex-1 text-sm">
            ★ 覚醒
          </button>
        )}
      </div>
    </div>
  );
};

const StatItem = ({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) => (
  <div className="bg-gray-800/60 rounded-lg p-2">
    <p className="text-gray-400 text-xs">{icon} {label}</p>
    <p className={`font-black text-lg ${color}`}>{formatNumber(value)}</p>
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
