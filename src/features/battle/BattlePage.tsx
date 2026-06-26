import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuestStore } from '../../stores/questStore';
import { usePartyStore } from '../../stores/partyStore';
import { useUnitStore } from '../../stores/unitStore';
import { usePlayerStore } from '../../stores/playerStore';
import { useEquipmentStore } from '../../stores/equipmentStore';
import { useMissionStore } from '../../stores/missionStore';
import { getStage } from '../../data/quests';
import { getEnemyMaster } from '../../data/enemies';
import { UNIT_MASTER, calcUnitStats } from '../../data/units';
import { FRIEND_CANDIDATES } from '../../data/friends';
import { getSkill } from '../../data/skills';
import { getItemMaster } from '../../data/items';
import { calcEquipmentStats, getEquipmentMaster } from '../../data/equipments';
import {
  executeNormalAttack, executeSkillOnTargets, executeEnemyTurn, tickBuffs, applyLeaderSkills,
} from '../../utils/battleEngine';
import { elementGradient } from '../../utils/elementUtils';
import { HpBar } from '../../components/ui/HpBar';
import { BBGauge } from '../../components/ui/BBGauge';
import { ElementBadge } from '../../components/ui/ElementBadge';
import type { BattleUnit, BattleEnemy, BattleLog, QuestStage, LeaderSkillEffect } from '../../types';

let idCounter = 0;
const uid = () => `bid_${Date.now()}_${idCounter++}`;

type Phase = 'battle' | 'victory' | 'defeat';

export const BattlePage = () => {
  const navigate = useNavigate();
  const { pendingStageId, pendingFriendId, clearPending, markCleared } = useQuestStore();
  const { getActiveParty } = usePartyStore();
  const { ownedUnits, levelUpUnit } = useUnitStore();
  const { spendStamina, addGold, addExp, addItem } = usePlayerStore();
  const { getEquippedByUnit } = useEquipmentStore();
  const { addDailyProgress } = useMissionStore();

  const [allies, setAllies] = useState<BattleUnit[]>([]);
  const [enemies, setEnemies] = useState<BattleEnemy[]>([]);
  const [stage, setStage] = useState<QuestStage | null>(null);
  const [waveIndex, setWaveIndex] = useState(0);
  const [round, setRound] = useState(1);
  const [logs, setLogs] = useState<BattleLog[]>([]);
  const [phase, setPhase] = useState<Phase>('battle');
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [actedUnitIds, setActedUnitIds] = useState<string[]>([]);
  const [isEnemyPhase, setIsEnemyPhase] = useState(false);
  const [rewardGold, setRewardGold] = useState(0);
  const [rewardExp, setRewardExp] = useState(0);
  const [rewardItems, setRewardItems] = useState<string[]>([]);
  const [damageFloats, setDamageFloats] = useState<{ id: string; text: string; x: number; y: number }[]>([]);
  const [isAutoMode, setIsAutoMode] = useState(false);

  const buildWave = useCallback((s: QuestStage, wIdx: number): BattleEnemy[] => {
    const wave = s.waves[wIdx];
    if (!wave) return [];
    return wave.enemies.flatMap(e => {
      const master = getEnemyMaster(e.enemyId);
      if (!master) return [];
      const lv = 1 + (e.level - 1) * 0.1;
      return [{
        instanceId: uid(),
        masterId: master.id,
        name: `${master.name}(Lv${e.level})`,
        element: master.element,
        currentHp: Math.floor(master.stats.hp * lv),
        maxHp: Math.floor(master.stats.hp * lv),
        atk: Math.floor(master.stats.atk * lv),
        def: Math.floor(master.stats.def * lv),
        skillId: master.skillId,
        isAlly: false as const,
        buffs: [],
        emoji: master.emoji,
      }];
    });
  }, []);

  // バトル初期化
  useEffect(() => {
    if (!pendingStageId) { navigate('/quests'); return; }
    const s = getStage(pendingStageId);
    if (!s) { navigate('/quests'); return; }

    const ok = spendStamina(s.staminaCost);
    if (!ok) { navigate('/quests'); return; }

    const party = getActiveParty();
    const friendCandidate = pendingFriendId
      ? FRIEND_CANDIDATES.find(f => f.friendId === pendingFriendId)
      : null;

    // リーダースキルを収集（自軍リーダー + フレンドリーダー）
    const leaderEffects: LeaderSkillEffect[] = [];
    const leaderSlotId = party.slots.find(Boolean);
    if (leaderSlotId) {
      const ownedLeader = ownedUnits.find(u => u.instanceId === leaderSlotId);
      if (ownedLeader) {
        const lm = UNIT_MASTER.find(m => m.id === ownedLeader.masterId);
        if (lm?.leaderSkillEffect) leaderEffects.push(lm.leaderSkillEffect);
      }
    }

    let allyList: BattleUnit[] = party.slots
      .filter(Boolean)
      .flatMap(id => {
        const owned = ownedUnits.find(u => u.instanceId === id);
        if (!owned) return [];
        const master = UNIT_MASTER.find(m => m.id === owned.masterId);
        if (!master) return [];
        const stats = calcUnitStats(master, owned.level, owned.awakenRank);

        // 装備ステータスを加算
        const equips = getEquippedByUnit(owned.instanceId);
        const eqBonus = equips.reduce((acc, eq) => {
          const em = getEquipmentMaster(eq.masterId);
          if (!em) return acc;
          const es = calcEquipmentStats(em, eq.level);
          return {
            hp:  acc.hp  + (es.hp  || 0),
            atk: acc.atk + (es.atk || 0),
            def: acc.def + (es.def || 0),
            rec: acc.rec + (es.rec || 0),
          };
        }, { hp: 0, atk: 0, def: 0, rec: 0 });

        const totalHp  = stats.hp  + eqBonus.hp;
        const totalAtk = stats.atk + eqBonus.atk;
        const totalDef = stats.def + eqBonus.def;
        const totalRec = stats.rec + eqBonus.rec;

        return [{
          instanceId: owned.instanceId,
          masterId: master.id,
          name: master.name,
          element: master.element,
          currentHp: totalHp,
          maxHp: totalHp,
          atk: totalAtk,
          def: totalDef,
          rec: totalRec,
          bbGauge: 0,
          skillId: master.skillId,
          bbSkillId: master.bbSkillId,
          isFriend: false,
          isAlly: true as const,
          buffs: [],
          emoji: master.emoji,
        }];
      });

    if (friendCandidate) {
      const fm = UNIT_MASTER.find(m => m.id === friendCandidate.leaderUnitMasterId);
      if (fm) {
        if (fm.leaderSkillEffect) leaderEffects.push(fm.leaderSkillEffect);
        const stats = calcUnitStats(fm, friendCandidate.leaderUnitLevel, friendCandidate.leaderUnitAwakenRank);
        allyList.push({
          instanceId: `friend_${friendCandidate.friendId}`,
          masterId: fm.id,
          name: `[F]${fm.name}`,
          element: fm.element,
          currentHp: stats.hp,
          maxHp: stats.hp,
          atk: stats.atk,
          def: stats.def,
          rec: stats.rec,
          bbGauge: 0,
          skillId: fm.skillId,
          bbSkillId: fm.bbSkillId,
          isFriend: true,
          isAlly: true,
          buffs: [],
          emoji: fm.emoji,
        });
      }
    }

    // リーダースキル適用
    if (leaderEffects.length > 0) {
      allyList = applyLeaderSkills(allyList, leaderEffects);
    }

    if (allyList.length === 0) {
      navigate('/party', { replace: true });
      return;
    }

    const enemyList = buildWave(s, 0);
    setAllies(allyList);
    setEnemies(enemyList);
    setStage(s);
    setWaveIndex(0);
    setRound(1);
    setLogs([]);
    setPhase('battle');
    setActedUnitIds([]);
    setSelectedUnit(allyList[0]?.instanceId ?? null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addLog = useCallback((log: BattleLog) => {
    setLogs(prev => [log, ...prev].slice(0, 20));
  }, []);

  // ===== オートバトル =====
  useEffect(() => {
    if (!isAutoMode || phase !== 'battle' || isEnemyPhase) return;
    if (!selectedUnit) return;
    const actor = allies.find(a => a.instanceId === selectedUnit);
    if (!actor || actor.currentHp <= 0) return;
    if (actedUnitIds.includes(selectedUnit)) return;

    const timer = setTimeout(() => {
      // AI判断: BB満タンなら必殺技、50%でスキル、残りは通常
      if (actor.bbGauge >= 100) {
        doAction('bb');
      } else if (Math.random() < 0.5) {
        doAction('skill');
      } else {
        doAction('normal');
      }
    }, 600);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAutoMode, phase, isEnemyPhase, selectedUnit, actedUnitIds, allies]);

  const showFloat = useCallback((text: string) => {
    const id = uid();
    setDamageFloats(prev => [...prev, { id, text, x: 15 + Math.random() * 70, y: 10 + Math.random() * 50 }]);
    setTimeout(() => setDamageFloats(prev => prev.filter(f => f.id !== id)), 1000);
  }, []);

  const doAction = useCallback((actionType: 'normal' | 'skill' | 'bb') => {
    if (isEnemyPhase || phase !== 'battle' || !selectedUnit) return;
    const actor = allies.find(a => a.instanceId === selectedUnit);
    if (!actor || actor.currentHp <= 0) return;
    if (actedUnitIds.includes(selectedUnit)) return;
    if (actionType === 'bb' && actor.bbGauge < 100) return;

    let result: { updatedAllies: BattleUnit[]; updatedEnemies: BattleEnemy[]; logs: BattleLog[] };

    if (actionType === 'normal') {
      result = executeNormalAttack(actor, enemies, allies, round);
    } else {
      const skillId = actionType === 'bb' ? actor.bbSkillId : actor.skillId;
      const skill = getSkill(skillId);
      if (!skill) return;
      result = executeSkillOnTargets(actor, skill, allies, enemies, round);
      if (actionType === 'bb') {
        result.updatedAllies = result.updatedAllies.map(a =>
          a.instanceId === selectedUnit ? { ...a, bbGauge: 0 } : a
        );
      } else {
        result.updatedAllies = result.updatedAllies.map(a =>
          a.instanceId === selectedUnit ? { ...a, bbGauge: Math.min(100, a.bbGauge + 15) } : a
        );
      }
    }

    result.logs.forEach(l => {
      addLog(l);
      if (l.damage) showFloat(`-${l.damage.toLocaleString()}`);
      if (l.heal) showFloat(`+${l.heal.toLocaleString()} HP`);
    });

    const newEnemies = result.updatedEnemies;
    const newAllies = result.updatedAllies;
    const allEnemiesDead = newEnemies.every(e => e.currentHp <= 0);

    if (allEnemiesDead && stage) {
      const nextWave = waveIndex + 1;
      if (nextWave < stage.waves.length) {
        setWaveIndex(nextWave);
        setEnemies(buildWave(stage, nextWave));
        setAllies(newAllies);
        setActedUnitIds([]);
        setSelectedUnit(newAllies.find(a => a.currentHp > 0)?.instanceId ?? null);
      } else {
        // 勝利処理
        const gold = stage.rewardGold;
        const exp = stage.rewardExp;
        const items: string[] = [];
        stage.rewardItems.forEach(ri => {
          if (Math.random() < ri.chance) {
            for (let i = 0; i < ri.quantity; i++) items.push(ri.itemId);
          }
        });
        setRewardGold(gold);
        setRewardExp(exp);
        setRewardItems(items);
        setPhase('victory');
        markCleared(stage.id);
        clearPending();
        addGold(gold);
        addExp(exp);
        items.forEach(id => addItem(id, 1));
        const nonFriendAlive = newAllies.filter(a => !a.isFriend && a.currentHp > 0);
        const nonFriendCount = newAllies.filter(a => !a.isFriend).length || 1;
        nonFriendAlive.forEach(a => levelUpUnit(a.instanceId, Math.floor(exp / nonFriendCount)));
        // ミッション進捗
        addDailyProgress('battle_win');
        addDailyProgress('quest_clear');
        if (newAllies.some(a => a.isFriend && a.currentHp > 0)) {
          addDailyProgress('friend_battle');
        }
      }
      return;
    }

    // ユニットを行動済みに登録し、次の未行動ユニットを選択
    const newActedIds = [...actedUnitIds, selectedUnit];
    const nextUnit = newAllies.find(a => a.currentHp > 0 && !newActedIds.includes(a.instanceId));
    setSelectedUnit(nextUnit?.instanceId ?? null);
    setActedUnitIds(newActedIds);
    setAllies(newAllies);
    setEnemies(newEnemies);

    // 全員行動済みなら敵フェーズ開始
    const aliveAllies = newAllies.filter(a => a.currentHp > 0);
    const allActed = aliveAllies.every(a => newActedIds.includes(a.instanceId));

    if (allActed) {
      setIsEnemyPhase(true);
      setTimeout(() => {
        // 敵の全員が順番に行動する（newAllies / newEnemies はこのクロージャで新鮮）
        let curAllies = [...newAllies];
        const aliveEnemies = newEnemies.filter(e => e.currentHp > 0);

        aliveEnemies.forEach(enemy => {
          const res = executeEnemyTurn(enemy, curAllies, aliveEnemies, round + 1);
          res.logs.forEach(l => {
            addLog(l);
            if (l.damage) showFloat(`-${l.damage.toLocaleString()}`);
          });
          curAllies = res.updatedAllies;
        });

        const allAlliesDead = curAllies.every(a => a.currentHp <= 0);
        if (allAlliesDead) {
          setPhase('defeat');
          clearPending();
          setIsEnemyPhase(false);
          return;
        }

        const ticked = tickBuffs(curAllies, newEnemies);
        setAllies(ticked.allies);
        setEnemies(ticked.enemies);
        setRound(r => r + 1);
        setActedUnitIds([]);
        setSelectedUnit(ticked.allies.find(a => a.currentHp > 0)?.instanceId ?? null);
        setIsEnemyPhase(false);
      }, 800);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allies, enemies, isEnemyPhase, phase, selectedUnit, actedUnitIds, round, stage, waveIndex, addLog, showFloat, buildWave]);

  const selectedAlly = allies.find(a => a.instanceId === selectedUnit);
  const aliveAllies = allies.filter(a => a.currentHp > 0);
  const actedCount = aliveAllies.filter(a => actedUnitIds.includes(a.instanceId)).length;
  const isActedSelected = actedUnitIds.includes(selectedUnit ?? '');
  const isBBReady = (selectedAlly?.bbGauge ?? 0) >= 100;

  if (!stage) return (
    <div className="min-h-screen flex items-center justify-center battle-bg">
      <p className="text-purple-300 animate-pulse">読み込み中...</p>
    </div>
  );

  if (phase === 'victory') {
    return <VictoryScreen gold={rewardGold} exp={rewardExp} items={rewardItems}
      onHome={() => navigate('/')} onRetry={() => navigate('/quests')} />;
  }
  if (phase === 'defeat') {
    return <DefeatScreen onHome={() => navigate('/')} onRetry={() => navigate('/quests')} />;
  }

  return (
    <div className="min-h-screen flex flex-col battle-bg select-none">
      {/* ヘッダー */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-purple-900/30">
        <div>
          <p className="text-purple-400 text-xs font-medium tracking-wide">{stage.name}</p>
          <p className="text-white text-sm font-bold">
            Wave {waveIndex + 1}<span className="text-gray-500">/{stage.waves.length}</span>
            <span className="text-gray-600 mx-1.5">·</span>
            Round <span className="text-purple-300">{round}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* 行動インジケーター */}
          <div className="flex items-center gap-1 bg-black/40 rounded-full px-2.5 py-1.5">
            {aliveAllies.map(a => (
              <div key={a.instanceId}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  actedUnitIds.includes(a.instanceId) ? 'bg-gray-600' : 'bg-emerald-400'
                }`} />
            ))}
          </div>
          {/* オートバトルボタン */}
          <button onClick={() => setIsAutoMode(p => !p)}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
              isAutoMode
                ? 'bg-yellow-600/30 border-yellow-500/60 text-yellow-400 animate-glow'
                : 'border-gray-700/50 text-gray-500'
            }`}>
            AUTO
          </button>
          <button onClick={() => { clearPending(); navigate('/quests'); }}
            className="text-gray-500 text-xs border border-gray-700/50 px-3 py-1.5 rounded-lg hover:text-gray-300 transition-colors">
            離脱
          </button>
        </div>
      </div>

      {/* 敵エリア */}
      <div className="relative px-4 py-5 flex justify-center gap-5 min-h-[150px] enemy-area">
        {damageFloats.map(f => (
          <div key={f.id}
            className="absolute font-black text-xl animate-float-up pointer-events-none z-20"
            style={{ left: `${f.x}%`, top: `${f.y}%`, color: f.text.startsWith('+') ? '#34d399' : '#fbbf24', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
            {f.text}
          </div>
        ))}
        {enemies.map(enemy => (
          <div key={enemy.instanceId}
            className={`text-center transition-all duration-300 ${enemy.currentHp <= 0 ? 'opacity-20 scale-75' : ''}`}>
            <div className="text-5xl mb-1.5"
              style={{ filter: enemy.currentHp <= 0 ? 'grayscale(1)' : 'drop-shadow(0 0 14px rgba(239,68,68,0.7))' }}>
              {enemy.emoji}
            </div>
            <p className="text-white text-xs font-bold truncate max-w-[80px]">{enemy.name}</p>
            <div className="w-20 mt-1.5">
              <HpBar current={enemy.currentHp} max={enemy.maxHp} height="h-1.5" />
              <p className="text-xs text-gray-500 mt-0.5">{enemy.currentHp.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* バトルログ */}
      <div className="mx-4 mb-2">
        <div className="bg-black/50 border border-purple-900/25 rounded-xl px-3 py-2 h-[52px] overflow-hidden">
          {logs.slice(0, 2).map((log, i) => (
            <p key={i} className={`text-xs truncate leading-relaxed ${i === 0 ? 'text-gray-200' : 'text-gray-600'}`}>
              <span className={i === 0 ? 'text-purple-400' : 'text-gray-700'}>{log.actorName}</span>
              {' '}
              {log.action === 'normal_attack' ? '通常攻撃' : log.action === 'skill' ? 'スキル' : '必殺技'}
              {log.damage ? ` → ${log.damage.toLocaleString()}${log.elementBonus ? '【有利】' : ''}` : ''}
              {log.heal ? ` → +${log.heal.toLocaleString()} 回復` : ''}
            </p>
          ))}
          {logs.length === 0 && <p className="text-gray-700 text-xs">バトル開始</p>}
        </div>
      </div>

      {/* 行動進捗バー */}
      <div className="mx-4 mb-2">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-600">行動 {actedCount}/{aliveAllies.length}</span>
          {actedCount > 0 && actedCount === aliveAllies.length && !isEnemyPhase && (
            <span className="text-orange-400 font-bold text-xs">全員行動完了 → 敵ターン</span>
          )}
        </div>
        <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-violet-600 to-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${aliveAllies.length > 0 ? (actedCount / aliveAllies.length) * 100 : 0}%` }} />
        </div>
      </div>

      {/* 味方一覧 */}
      <div className="px-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 pb-1">
          {allies.map(ally => {
            const isActed = actedUnitIds.includes(ally.instanceId);
            const isSelected = selectedUnit === ally.instanceId;
            const isDead = ally.currentHp <= 0;
            return (
              <button
                key={ally.instanceId}
                onClick={() => {
                  if (!isDead && !isActed && !isEnemyPhase) setSelectedUnit(ally.instanceId);
                }}
                className={`flex-shrink-0 w-[68px] rounded-xl p-1.5 border-2 transition-all duration-200 unit-card-hover
                  ${isSelected ? 'ally-card-selected' : ally.isFriend ? 'border-purple-500/50' : 'border-white/10'}
                  ${isActed ? 'ally-card-acted' : ''}
                  ${ally.bbGauge >= 100 && !isActed ? 'ally-card-bb-ready' : ''}`}
                style={{ background: elementGradient(ally.element) }}
              >
                <div className="text-2xl text-center mb-0.5">{ally.emoji}</div>
                <HpBar current={ally.currentHp} max={ally.maxHp} height="h-1" />
                <BBGauge value={ally.bbGauge} size="sm" />
                <div className="flex items-center justify-center gap-0.5 mt-0.5">
                  {ally.isFriend && <span className="text-purple-300 text-[9px] font-bold">F</span>}
                  {isActed && !isDead && <span className="text-gray-500 text-[9px]">済</span>}
                  {isDead && <span className="text-gray-600 text-[9px]">KO</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 選択中ユニット情報 */}
      {selectedAlly ? (
        <div className="mx-4 mt-2 card-glass p-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: elementGradient(selectedAlly.element), boxShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
              {selectedAlly.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <p className="text-white text-sm font-bold truncate">{selectedAlly.name}</p>
                <ElementBadge element={selectedAlly.element} size="sm" />
                {isActedSelected && <span className="text-gray-500 text-xs bg-gray-800/60 rounded px-1">行動済</span>}
              </div>
              <HpBar current={selectedAlly.currentHp} max={selectedAlly.maxHp} height="h-1.5" />
              <p className="text-gray-500 text-xs mt-0.5">
                {selectedAlly.currentHp.toLocaleString()} / {selectedAlly.maxHp.toLocaleString()}
              </p>
            </div>
            <div className="text-right flex-shrink-0 pl-1">
              <p className="text-gray-600 text-[10px] mb-0.5">BB</p>
              <BBGauge value={selectedAlly.bbGauge} size="md" />
              <p className={`text-xs font-bold mt-0.5 ${isBBReady ? 'text-gradient-gold animate-glow' : 'text-gray-600'}`}>
                {selectedAlly.bbGauge}%
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-4 mt-2 h-[72px]" />
      )}

      {/* アクションボタン */}
      <div className="px-4 mt-3 mb-safe mb-4 grid grid-cols-3 gap-2.5">
        <ActionBtn
          label="通常攻撃" icon="⚔️"
          onClick={() => doAction('normal')}
          disabled={isEnemyPhase || !selectedUnit || (selectedAlly?.currentHp ?? 0) <= 0 || isActedSelected}
          variant="default"
        />
        <ActionBtn
          label="スキル" icon="✨"
          onClick={() => doAction('skill')}
          disabled={isEnemyPhase || !selectedUnit || (selectedAlly?.currentHp ?? 0) <= 0 || isActedSelected}
          variant="skill"
        />
        <ActionBtn
          label="必殺技" icon="🔥"
          onClick={() => doAction('bb')}
          disabled={isEnemyPhase || !isBBReady || (selectedAlly?.currentHp ?? 0) <= 0 || isActedSelected}
          variant={isBBReady ? 'bb-ready' : 'default'}
          glowing={isBBReady}
        />
      </div>

      {/* 敵フェーズオーバーレイ */}
      {isEnemyPhase && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-40">
          <div className="animate-fade-in">
            <div className="px-10 py-5 rounded-2xl border border-red-900/50 bg-black/70 backdrop-blur-sm">
              <p className="text-red-400 font-black text-2xl tracking-[0.2em]">ENEMY TURN</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ===== アクションボタン =====
const ActionBtn = ({
  label, icon, onClick, disabled, variant, glowing,
}: {
  label: string; icon: string;
  onClick: () => void; disabled: boolean;
  variant: 'default' | 'skill' | 'bb-ready'; glowing?: boolean;
}) => {
  const styles: Record<string, { bg: string; border: string; shadow: string }> = {
    default: {
      bg: 'linear-gradient(160deg, #374151, #1f2937)',
      border: 'rgba(107,114,128,0.35)',
      shadow: '0 2px 10px rgba(0,0,0,0.3)',
    },
    skill: {
      bg: 'linear-gradient(160deg, #1e3a8a, #3b82f6)',
      border: 'rgba(59,130,246,0.4)',
      shadow: '0 2px 16px rgba(59,130,246,0.25)',
    },
    'bb-ready': {
      bg: 'linear-gradient(160deg, #92400e, #ef4444)',
      border: 'rgba(245,158,11,0.6)',
      shadow: '0 2px 20px rgba(245,158,11,0.4)',
    },
  };
  const s = styles[variant];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`py-4 rounded-2xl font-bold text-sm text-white transition-all active:scale-95 disabled:opacity-35 flex flex-col items-center gap-0.5 ${glowing ? 'animate-bb-ready' : ''}`}
      style={{
        background: s.bg,
        border: `1px solid ${s.border}`,
        boxShadow: s.shadow + ', inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
};

// ===== 勝利画面 =====
const VictoryScreen = ({ gold, exp, items, onHome, onRetry }: {
  gold: number; exp: number; items: string[];
  onHome: () => void; onRetry: () => void;
}) => (
  <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center battle-bg">
    <div className="animate-slide-up w-full max-w-sm">
      <p className="text-7xl mb-3 drop-shadow-2xl">🏆</p>
      <h2 className="text-4xl font-black text-gradient-gold mb-1">VICTORY!</h2>
      <p className="text-gray-500 text-sm mb-6">クエストクリア！</p>
      <div className="card-base p-5 mb-6 text-left">
        <h3 className="text-gray-600 text-[10px] font-bold mb-4 uppercase tracking-widest">獲得報酬</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">🪙 ゴールド</span>
            <span className="text-yellow-400 font-bold text-lg">{gold.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">✨ 経験値</span>
            <span className="text-blue-400 font-bold text-lg">{exp}</span>
          </div>
          {items.length > 0 && (
            <div className="pt-3 border-t border-gray-700/40">
              <p className="text-gray-600 text-xs mb-2">アイテム</p>
              {items.map((id, i) => {
                const m = getItemMaster(id);
                return m ? (
                  <div key={i} className="flex items-center gap-2 py-1">
                    <span className="text-lg">{m.emoji}</span>
                    <span className="text-gray-200 text-sm">{m.name}</span>
                  </div>
                ) : null;
              })}
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={onHome} className="btn-secondary flex-1">ホームへ</button>
        <button onClick={onRetry} className="btn-primary flex-1">クエストへ</button>
      </div>
    </div>
  </div>
);

// ===== 敗北画面 =====
const DefeatScreen = ({ onHome, onRetry }: { onHome: () => void; onRetry: () => void }) => (
  <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center battle-bg">
    <div className="animate-slide-up w-full max-w-sm">
      <p className="text-7xl mb-3 drop-shadow-2xl">💀</p>
      <h2 className="text-4xl font-black text-red-500 mb-1">DEFEAT</h2>
      <p className="text-gray-600 text-sm mb-10">全滅してしまいました…</p>
      <div className="flex gap-3">
        <button onClick={onHome} className="btn-secondary flex-1">ホームへ</button>
        <button onClick={onRetry} className="btn-danger flex-1">再挑戦</button>
      </div>
    </div>
  </div>
);
