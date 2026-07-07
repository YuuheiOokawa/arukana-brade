import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuestStore } from '../../stores/questStore';
import { usePartyStore } from '../../stores/partyStore';
import { useUnitStore } from '../../stores/unitStore';
import { usePlayerStore } from '../../stores/playerStore';
import { useEquipmentStore } from '../../stores/equipmentStore';
import { useMissionStore } from '../../stores/missionStore';
import { useGuildStore } from '../../stores/guildStore';
import { saveImmediately } from '../../lib/syncService';
import { getStage } from '../../data/quests';
import { getEventStage, getRaidStage } from '../../data/events';
import { useRaidStore } from '../../stores/raidStore';
import { getScenario } from '../../data/scenarios';
import { getEnemyMaster } from '../../data/enemies';
import { UNIT_MASTER, calcUnitStats } from '../../data/units';
import { FRIEND_CANDIDATES } from '../../data/friends';
import { getItemMaster } from '../../data/items';
import { calcEquipmentStats, getEquipmentMaster } from '../../data/equipments';
import { applyLeaderSkills, executeNormalAttack, executeEnemyTurn, executeSkillOnTargets, tickBuffs } from '../../utils/battleEngine';
import { getSkill } from '../../data/skills';
import { GameButton } from '../../components/ui/game/GameButton';
import type { BattleUnit, BattleEnemy, BattleLog, QuestStage, LeaderSkillEffect } from '../../types';
import { UnitIcon } from '../../components/ui/UnitCard';
import { resolveUnitImage } from '../../lib/unitImage';

let idCounter = 0;
const uid = () => `bid_${Date.now()}_${idCounter++}`;

type Phase = 'battle' | 'victory' | 'defeat';

// ===== ログ着色 =====
const logColor = (line: string) => {
  if (line.startsWith('⚔️') || line.startsWith('✨')) return 'text-blue-300';
  if (line.startsWith('🔴')) return 'text-red-400';
  if (line.startsWith('💀') && line.includes('撃破')) return 'text-yellow-400';
  if (line.startsWith('💀')) return 'text-red-500';
  if (line.startsWith('😵')) return 'text-red-500';
  if (line.startsWith('━━') || line.startsWith('──')) return 'text-purple-400 font-bold';
  if (line.startsWith('💥')) return 'text-orange-400';
  return 'text-gray-300';
};

export const BattlePage = () => {
  const navigate = useNavigate();
  const { pendingStageId, pendingFriendId, clearPending, markCleared, checkAreaComplete, claimAreaReward, recordStars } = useQuestStore();
  const { getActiveParty } = usePartyStore();
  const { ownedUnits, levelUpUnit } = useUnitStore();
  const { spendStamina, recoverStamina, addGold, addExp, addItem, syncCurrencyToServer, recordBattleWin, recordQuestClear } = usePlayerStore();
  const { dealDamage: dealRaidDamage } = useRaidStore();
  const { getEquippedByUnit } = useEquipmentStore();
  const { addDailyProgress, addWeeklyProgress } = useMissionStore();

  const [allies, setAllies] = useState<BattleUnit[]>([]);
  const [enemies, setEnemies] = useState<BattleEnemy[]>([]);
  const [stage, setStage] = useState<QuestStage | null>(null);
  const [waveIndex, setWaveIndex] = useState(0);
  const [round, setRound] = useState(1);
  const [logs, setLogs] = useState<string[]>([]);
  const [logQueue, setLogQueue] = useState<string[]>([]);
  const isLogAnimatingRef = useRef(false);
  const totalDamageRef = useRef(0);
  const [phase, setPhase] = useState<Phase>('battle');
  const [leaderBbGauge, setLeaderBbGauge] = useState(0);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [battleSpeed, setBattleSpeed] = useState<1 | 2>(() =>
    localStorage.getItem('arcana-battle-speed') === '2' ? 2 : 1
  );
  const battleSpeedRef = useRef(battleSpeed);
  battleSpeedRef.current = battleSpeed;

  const toggleSpeed = () => {
    setBattleSpeed(prev => {
      const next = prev === 1 ? 2 : 1;
      localStorage.setItem('arcana-battle-speed', String(next));
      return next;
    });
  };
  const [rewardGold, setRewardGold] = useState(0);
  const [rewardExp, setRewardExp] = useState(0);
  const [rewardItems, setRewardItems] = useState<string[]>([]);
  const [areaClearedKey, setAreaClearedKey] = useState<string | null>(null);
  const [earnedStars, setEarnedStars] = useState(0);
  // ハードモード: 敵Lv+10 / スタミナ1.5倍 / 報酬2倍
  const isHardRef = useRef(false);
  const [isHardMode, setIsHardMode] = useState(false);

  const buildWave = useCallback((s: QuestStage, wIdx: number): BattleEnemy[] => {
    const wave = s.waves[wIdx];
    if (!wave) return [];
    const hardBonus = isHardRef.current ? 10 : 0;
    return wave.enemies.flatMap(e => {
      const master = getEnemyMaster(e.enemyId);
      if (!master) return [];
      const level = e.level + hardBonus;
      const lv = 1 + (level - 1) * 0.1;
      return [{
        instanceId: uid(),
        masterId: master.id,
        name: `${master.name}(Lv${level})`,
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
    const s = getStage(pendingStageId) ?? getEventStage(pendingStageId) ?? getRaidStage(pendingStageId);
    if (!s) { navigate('/quests'); return; }

    const party = getActiveParty();
    if (!party.slots.some(Boolean)) { navigate('/party'); return; }

    // ハードモード判定（レイドは常にノーマル扱い）
    const hard = useQuestStore.getState().pendingHard && !pendingStageId.startsWith('raid_');
    isHardRef.current = hard;
    setIsHardMode(hard);

    recoverStamina();
    const staminaCost = hard ? Math.ceil(s.staminaCost * 1.5) : s.staminaCost;
    const ok = spendStamina(staminaCost);
    if (!ok) { navigate('/quests'); return; }
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
          const es = calcEquipmentStats(em, eq.level, eq.evolveRank ?? 0);
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
          currentRarity: Number(owned.currentRarity) || 1,
          currentHp: totalHp,
          maxHp: totalHp,
          atk: totalAtk,
          def: totalDef,
          rec: totalRec,
          bbGauge: 0,
          skillId: master.skillId,
          bbSkillId: owned.customBbSkillId ?? master.bbSkillId,
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
          currentRarity: 1,
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
    setLogs([`━━ Wave 1 開始！ ━━━━━━━━━━━━━━`]);
    setPhase('battle');
    setLeaderBbGauge(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ログをキューに積んで順次表示
  const addLogs = useCallback((newLines: string[]) => {
    setLogQueue(prev => [...prev, ...newLines]);
  }, []);

  // 80ms ごとに1行ずつ表示（refで排他制御: wave遷移の再レンダリングでフラグが詰まらないように）
  // 倍速時は表示間隔も半分にする
  useEffect(() => {
    if (logQueue.length === 0 || isLogAnimatingRef.current) return;
    isLogAnimatingRef.current = true;
    const timer = setTimeout(() => {
      setLogQueue(prev => {
        const [first, ...rest] = prev;
        if (first !== undefined) setLogs(prev2 => [first, ...prev2].slice(0, 60));
        return rest;
      });
      isLogAnimatingRef.current = false;
    }, 80 / battleSpeedRef.current);
    return () => {
      clearTimeout(timer);
      isLogAnimatingRef.current = false; // タイマーキャンセル時もフラグをリセット
    };
  }, [logQueue]);

  // ===== 1ラウンド処理 =====
  const processRound = useCallback((useSkill: boolean) => {
    if (phase !== 'battle') return;

    setAllies(curAllies => {
      setEnemies(curEnemies => {
        setRound(curRound => {
          setLeaderBbGauge(curBb => {
            const newLines: string[] = [];
            newLines.push(`── Round ${curRound} ──────────────────`);

            let updAllies = curAllies.map(a => ({ ...a }));
            let updEnemies = curEnemies.map(e => ({ ...e }));

            const liveAllies = updAllies.filter(a => a.currentHp > 0);
            const liveEnemies = updEnemies.filter(e => e.currentHp > 0);

            if (liveAllies.length === 0 || liveEnemies.length === 0) return curBb;

            const leader = liveAllies[0];
            const isSkillTurn = useSkill && curBb >= 100;

            // ===== 味方フェーズ =====
            let nextBb = curBb;

            // BattleResultを updAllies/updEnemies に反映（bbGaugeは leaderBbGauge で別管理）
            const applyEnemyResult = (result: { updatedAllies: BattleUnit[]; updatedEnemies: BattleEnemy[]; logs: BattleLog[] }) => {
              const prevHps = new Map(updEnemies.map(e => [e.instanceId, e.currentHp]));
              updAllies = updAllies.map(a => {
                const u = result.updatedAllies.find(ua => ua.instanceId === a.instanceId);
                return u ? { ...u, bbGauge: a.bbGauge } : a;
              });
              updEnemies = updEnemies.map(e => result.updatedEnemies.find(ue => ue.instanceId === e.instanceId) ?? e);
              result.updatedEnemies.forEach(e => {
                if (e.currentHp <= 0 && (prevHps.get(e.instanceId) ?? 1) > 0) newLines.push(`💀 ${e.name} を撃破！`);
              });
              totalDamageRef.current += result.logs.reduce((s, l) => s + (l.damage ?? 0), 0);
            };

            if (isSkillTurn) {
              // BBスキル（リーダー）
              const leaderSkill = leader.bbSkillId ? getSkill(leader.bbSkillId) : null;
              if (leaderSkill) {
                const result = executeSkillOnTargets(leader, leaderSkill, updAllies, updEnemies, curRound);
                applyEnemyResult(result);
                result.logs.forEach(log => {
                  const elem = log.elementBonus ? '（属性有利！）' : '';
                  newLines.push(log.heal
                    ? `💚 ${leader.emoji} ${log.actorName} のスキル → ${log.targetNames.join('・')} を ${log.heal.toLocaleString()} 回復！`
                    : `✨ ${leader.emoji} ${log.actorName} のBBスキル → ${log.targetNames.join('・')} に ${(log.damage ?? 0).toLocaleString()} ダメージ！${elem}`);
                });
              } else {
                // フォールバック: 全体2〜3倍ダメージ
                const multiplier = 2 + Math.random();
                let totalDmg = 0;
                const prevHps = new Map(updEnemies.map(e => [e.instanceId, e.currentHp]));
                updEnemies = updEnemies.map(e => {
                  if (e.currentHp <= 0) return e;
                  const dmg = Math.max(1, Math.floor(leader.atk * (0.8 + Math.random() * 0.4) * multiplier - e.def * 0.3));
                  totalDmg += dmg;
                  return { ...e, currentHp: Math.max(0, e.currentHp - dmg) };
                });
                totalDamageRef.current += totalDmg;
                newLines.push(`✨ ${leader.emoji} ${leader.name} のBBスキル発動！全体に ${totalDmg.toLocaleString()} ダメージ！`);
                updEnemies.forEach(e => {
                  if (e.currentHp <= 0 && (prevHps.get(e.instanceId) ?? 1) > 0) newLines.push(`💀 ${e.name} を撃破！`);
                });
              }
              // 残りの味方は通常攻撃
              for (let i = 1; i < liveAllies.length; i++) {
                const ally = liveAllies[i];
                if (!updEnemies.some(e => e.currentHp > 0)) break;
                const result = executeNormalAttack(ally, updEnemies.filter(e => e.currentHp > 0), updAllies, curRound);
                applyEnemyResult(result);
                result.logs.forEach(log => {
                  const elem = log.elementBonus ? '（属性有利！）' : '';
                  newLines.push(`⚔️ ${ally.emoji} ${log.actorName} → ${log.targetNames.join('・')} に ${(log.damage ?? 0).toLocaleString()} ダメージ！${elem}`);
                });
              }
              nextBb = 0;
            } else {
              // 全味方が通常攻撃
              for (const ally of liveAllies) {
                if (!updEnemies.some(e => e.currentHp > 0)) break;
                const result = executeNormalAttack(ally, updEnemies.filter(e => e.currentHp > 0), updAllies, curRound);
                applyEnemyResult(result);
                result.logs.forEach(log => {
                  const elem = log.elementBonus ? '（属性有利！）' : '';
                  newLines.push(`⚔️ ${ally.emoji} ${log.actorName} → ${log.targetNames.join('・')} に ${(log.damage ?? 0).toLocaleString()} ダメージ！${elem}`);
                });
              }
              nextBb = Math.min(100, curBb + 20);
            }

            // ===== 敵フェーズ =====
            for (const enemy of updEnemies.filter(e => e.currentHp > 0)) {
              if (!updAllies.some(a => a.currentHp > 0)) break;
              const prevAllyHps = new Map(updAllies.map(a => [a.instanceId, a.currentHp]));
              const result = executeEnemyTurn(enemy, updAllies.filter(a => a.currentHp > 0), updEnemies, curRound);
              updAllies = updAllies.map(a => {
                const u = result.updatedAllies.find(ua => ua.instanceId === a.instanceId);
                return u ? { ...u, bbGauge: a.bbGauge } : a;
              });
              result.logs.forEach(log => {
                const prefix = (log.action === 'skill' || log.action === 'bb_skill') ? '💥' : '🔴';
                newLines.push(`${prefix} ${enemy.emoji} ${log.actorName} → ${log.targetNames.join('・')} に ${(log.damage ?? 0).toLocaleString()} ダメージ！`);
              });
              updAllies.forEach(a => {
                if (a.currentHp <= 0 && (prevAllyHps.get(a.instanceId) ?? 1) > 0) newLines.push(`😵 ${a.name} が倒れた...`);
              });
            }

            // ===== バフ/デバフ経過処理 =====
            const ticked = tickBuffs(updAllies, updEnemies);
            updAllies = ticked.allies;
            updEnemies = ticked.enemies;

            addLogs(newLines);

            // ===== 勝敗判定 =====
            const allDead = updEnemies.every(e => e.currentHp <= 0);
            if (allDead) {
              setStage(curStage => {
                if (!curStage) return curStage;
                const nextWave = waveIndex + 1;
                if (nextWave < curStage.waves.length) {
                  const newWaveEnemies = buildWave(curStage, nextWave);
                  setWaveIndex(nextWave);
                  setEnemies(newWaveEnemies);
                  setAllies(updAllies);
                  addLogs([`━━ Wave ${nextWave + 1} 開始！ ━━━━━━━━━━━━━━`]);
                } else {
                  const isHard = isHardRef.current;
                  const gold = curStage.rewardGold * (isHard ? 2 : 1);
                  const exp = curStage.rewardExp * (isHard ? 2 : 1);
                  const items: string[] = [];
                  curStage.rewardItems.forEach(ri => {
                    if (Math.random() < ri.chance) {
                      for (let i = 0; i < ri.quantity; i++) items.push(ri.itemId);
                    }
                  });
                  setRewardGold(gold);
                  setRewardExp(exp);
                  setRewardItems(items);

                  // 星評価: ★1=クリア / ★2=全員生存 / ★3=規定ラウンド以内（ウェーブ数×3）
                  const noDeaths = updAllies.every(a => a.currentHp > 0);
                  const fastClear = curRound <= curStage.waves.length * 3;
                  const stars = 1 + (noDeaths ? 1 : 0) + (fastClear ? 1 : 0);
                  setEarnedStars(stars);
                  const starKey = isHard ? `hard_${curStage.id}` : curStage.id;
                  recordStars(starKey, stars);

                  // ハードは "hard_" プレフィックスで別枠クリア記録（エリア進行には影響しない）
                  const isAreaClear = !isHard && checkAreaComplete(curStage.id);
                  markCleared(isHard ? `hard_${curStage.id}` : curStage.id);
                  clearPending();
                  addGold(gold);
                  addExp(exp);
                  items.forEach(id => addItem(id, 1));
                  if (isAreaClear) {
                    const parts = curStage.id.split('_');
                    if (parts.length >= 3) {
                      const areaKey = `${parts[1]}_${parts[2]}`;
                      claimAreaReward(areaKey);
                      setAreaClearedKey(areaKey);
                    }
                    addItem('item_summon_ticket', 5);
                  }
                  const nonFriendAlive = updAllies.filter(a => !a.isFriend && a.currentHp > 0);
                  const nonFriendCount = updAllies.filter(a => !a.isFriend).length || 1;
                  nonFriendAlive.forEach(a => levelUpUnit(a.instanceId, Math.floor(exp / nonFriendCount)));
                  addDailyProgress('battle_win');
                  addDailyProgress('quest_clear');
                  addWeeklyProgress('battle_win');
                  addWeeklyProgress('quest_clear');
                  if (updAllies.some(a => a.isFriend && a.currentHp > 0)) {
                    addDailyProgress('friend_battle');
                    addWeeklyProgress('friend_battle');
                  }
                  recordBattleWin();
                  recordQuestClear();
                  useGuildStore.getState().addGuildExp(Math.floor(exp * 0.1));
                  useGuildStore.getState().updateGuildMissionProgress('battle', 1);
                  if (curStage.id.startsWith('raid_')) {
                    const raidBossId = curStage.id.replace(/^raid_/, '').replace(/_stage$/, '');
                    const dmg = totalDamageRef.current;
                    totalDamageRef.current = 0;
                    dealRaidDamage(raidBossId, dmg);
                    void fetch('/api/actions', {
                      method: 'POST', credentials: 'include',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ action: 'raid_battle', bossId: raidBossId, damageDealt: dmg }),
                    }).catch(() => { /* saveAll でフォールバック */ });
                  }
                  setTimeout(() => {
                    void syncCurrencyToServer();
                    saveImmediately();
                  }, 500);
                  setPhase('victory');
                }
                return curStage;
              });
            } else if (updAllies.every(a => a.currentHp <= 0)) {
              clearPending();
              setPhase('defeat');
              setAllies(updAllies);
              setEnemies(updEnemies);
            } else {
              setAllies(updAllies);
              setEnemies(updEnemies);
              setRound(r => r + 1);
            }

            return nextBb;
          });
          return curRound;
        });
        return curEnemies;
      });
      return curAllies;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, waveIndex, addLogs, buildWave]);

  // オートモード（倍速時はラウンド間隔を短縮）
  useEffect(() => {
    if (!isAutoMode || phase !== 'battle') return;
    const timer = setTimeout(() => processRound(true), 1000 / battleSpeed);
    return () => clearTimeout(timer);
  }, [isAutoMode, phase, round, processRound, battleSpeed]);

  if (!stage) return (
    <div className="min-h-screen flex items-center justify-center battle-bg">
      <p className="text-purple-300 animate-pulse">読み込み中...</p>
    </div>
  );

  if (phase === 'victory') {
    const areaClearScenarioId = areaClearedKey ? `area_clear_${areaClearedKey}` : null;
    const hasAreaScenario = areaClearScenarioId ? !!getScenario(areaClearScenarioId) : false;
    return <VictoryScreen
      stageName={stage.name}
      round={round}
      gold={rewardGold}
      exp={rewardExp}
      items={rewardItems}
      stars={earnedStars}
      hardMode={isHardMode}
      onHome={() => navigate('/')}
      onQuest={() => navigate('/quests')}
      areaClearedKey={areaClearedKey ?? undefined}
      onAreaScenario={hasAreaScenario && areaClearScenarioId
        ? () => navigate(`/scenario/${areaClearScenarioId}`)
        : undefined}
    />;
  }
  if (phase === 'defeat') {
    return <DefeatScreen onHome={() => navigate('/')} onQuest={() => navigate('/quests')} />;
  }

  const liveAllies = allies.filter(a => a.currentHp > 0);
  const liveEnemies = enemies.filter(e => e.currentHp > 0);
  const isSkillReady = leaderBbGauge >= 100;

  return (
    <div className="min-h-screen flex flex-col battle-bg select-none text-sm">
      {/* ヘッダー */}
      <div className="px-3 pt-3 pb-2 flex items-center justify-between border-b border-purple-900/30">
        <div>
          <p className="text-purple-400 text-xs font-medium tracking-wide">
            {stage.name}
            {isHardMode && (
              <span className="ml-1.5 text-[9px] font-black px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(220,38,38,0.25)', color: '#fca5a5', border: '1px solid rgba(220,38,38,0.5)' }}>
                HARD
              </span>
            )}
          </p>
          <p className="text-white text-xs font-bold">
            Round <span className="text-purple-300">{round}</span>
            <span className="text-gray-600 mx-1">|</span>
            Wave <span className="text-purple-300">{waveIndex + 1}</span>
            <span className="text-gray-500">/{stage.waves.length}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSpeed}
            className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border transition-all ${
              battleSpeed === 2
                ? 'bg-blue-600/30 border-blue-500/60 text-blue-300'
                : 'border-gray-700/50 text-gray-500'
            }`}
          >
            ⏩ ×{battleSpeed}
          </button>
          <button
            onClick={() => setIsAutoMode(p => !p)}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
              isAutoMode
                ? 'bg-yellow-600/30 border-yellow-500/60 text-yellow-400'
                : 'border-gray-700/50 text-gray-500'
            }`}
          >
            🤖 オート {isAutoMode ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={() => { clearPending(); navigate('/quests'); }}
            className="text-gray-500 text-xs border border-gray-700/50 px-2.5 py-1.5 rounded-lg hover:text-gray-300 transition-colors"
          >
            🏃 退却
          </button>
        </div>
      </div>

      {/* 敵HP表示 */}
      <div className="px-3 py-2 border-b border-gray-800/50">
        <p className="text-gray-500 text-xs mb-1.5 font-bold tracking-wide">━━ 敵 ━━━━━━━━━━━━━━━━━━━━━━━━━━</p>
        <div className="flex flex-col gap-1.5">
          {enemies.map(e => {
            const pct = Math.max(0, e.currentHp / e.maxHp);
            const isDead = e.currentHp <= 0;
            return (
              <div key={e.instanceId} className={`flex items-center gap-2 ${isDead ? 'opacity-30' : ''}`}>
                <span className="text-base w-6 text-center">{e.emoji}</span>
                <span className="text-gray-200 text-xs w-28 truncate">{e.name}</span>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden flex-1">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${pct * 100}%`,
                      background: pct > 0.5 ? '#ef4444' : pct > 0.2 ? '#f97316' : '#dc2626',
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-20 text-right">
                  {e.currentHp.toLocaleString()}/{e.maxHp.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 味方HP表示 */}
      <div className="px-3 py-2 border-b border-gray-800/50">
        <p className="text-gray-500 text-xs mb-1.5 font-bold tracking-wide">━━ パーティ ━━━━━━━━━━━━━━━━━━━━</p>
        <div className="flex flex-col gap-1.5">
          {allies.map(a => {
            const pct = Math.max(0, a.currentHp / a.maxHp);
            const isDead = a.currentHp <= 0;
            return (
              <div key={a.instanceId} className={`flex items-center gap-2 ${isDead ? 'opacity-30' : ''}`}>
                <UnitIcon
                  src={resolveUnitImage(a.masterId, a.currentRarity)}
                  masterId={a.masterId}
                  unitRarity={a.currentRarity}
                  fallbackEmoji={a.emoji}
                  element={a.element}
                  size={24}
                  height={36}
                />
                <span className={`text-xs w-28 truncate ${a.isFriend ? 'text-purple-300' : 'text-gray-200'}`}>
                  {a.name}
                </span>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden flex-1">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${pct * 100}%`,
                      background: pct > 0.5 ? '#22c55e' : pct > 0.2 ? '#f59e0b' : '#ef4444',
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-20 text-right">
                  {a.currentHp.toLocaleString()}/{a.maxHp.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* バトルログ */}
      <div className="px-3 py-2 flex-1 overflow-hidden">
        <p className="text-gray-500 text-xs mb-1.5 font-bold tracking-wide">━━ バトルログ ━━━━━━━━━━━━━━━━━━</p>
        <div className="overflow-y-auto h-[160px] flex flex-col gap-0.5">
          {logs.map((line, i) => (
            <p key={i} className={`text-xs leading-relaxed ${logColor(line)}`}>{line}</p>
          ))}
          {logs.length === 0 && (
            <p className="text-gray-700 text-xs">バトル開始</p>
          )}
        </div>
      </div>

      {/* コマンドボタン */}
      <div className="px-3 pb-4 pt-2 border-t border-purple-900/30">
        <div className="flex gap-2">
          <button
            onClick={() => processRound(false)}
            disabled={phase !== 'battle' || liveAllies.length === 0 || liveEnemies.length === 0 || logQueue.length > 0}
            className="flex-1 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-b from-blue-700 to-blue-900 border border-blue-500/40 active:scale-95 transition-all disabled:opacity-40"
          >
            ⚔️ 攻撃
          </button>

          <div className="flex-1 flex flex-col gap-1">
            <button
              onClick={() => processRound(true)}
              disabled={phase !== 'battle' || !isSkillReady || liveAllies.length === 0 || liveEnemies.length === 0 || logQueue.length > 0}
              className={`w-full py-2.5 rounded-xl font-bold text-xs text-white border active:scale-95 transition-all disabled:opacity-40 ${
                isSkillReady
                  ? 'bg-gradient-to-b from-orange-600 to-red-800 border-orange-400/60'
                  : 'bg-gradient-to-b from-gray-700 to-gray-900 border-gray-600/40'
              }`}
            >
              💥 スキル BB:{leaderBbGauge}%
            </button>
            {/* BBゲージバー */}
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${leaderBbGauge}%`,
                  background: isSkillReady
                    ? 'linear-gradient(90deg, #f97316, #ef4444)'
                    : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===== 勝利画面 =====
const VictoryScreen = ({
  stageName, round, gold, exp, items, stars = 0, hardMode = false, onHome, onQuest, areaClearedKey, onAreaScenario,
}: {
  stageName: string; round: number; gold: number; exp: number; items: string[];
  stars?: number; hardMode?: boolean;
  onHome: () => void; onQuest: () => void;
  areaClearedKey?: string; onAreaScenario?: () => void;
}) => (
  <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center battle-bg">
    <div className="animate-slide-up w-full max-w-sm">
      <div style={{ fontSize: 72, marginBottom: 12, filter: 'drop-shadow(0 0 24px rgba(240,192,64,0.7))' }}>🏆</div>
      <p className="text-yellow-400 font-black text-3xl tracking-widest mb-1">
        VICTORY!
        {hardMode && <span className="text-red-400 text-sm ml-2 align-middle">HARD</span>}
      </p>
      <p className="text-gray-500 text-xs mb-1">{stageName}</p>

      {/* 星評価 */}
      {stars > 0 && (
        <div className="flex items-center justify-center gap-2 mb-2">
          {[1, 2, 3].map(i => (
            <span key={i} style={{
              fontSize: 30,
              filter: i <= stars ? 'drop-shadow(0 0 10px rgba(240,192,64,0.9))' : 'grayscale(1) brightness(0.4)',
            }}>
              {i <= stars ? '⭐' : '☆'}
            </span>
          ))}
        </div>
      )}
      {stars > 0 && stars < 3 && (
        <p className="text-gray-600 text-[10px] mb-2">
          {stars < 2 ? '★2: 全員生存でクリア / ' : ''}★3: 規定ラウンド以内にクリア
        </p>
      )}

      <p className="text-purple-400 text-xs mb-6">クリアラウンド: {round}</p>

      {/* エリアクリアバナー */}
      {areaClearedKey && (
        <div className="mb-4 rounded-2xl p-4 border border-yellow-500/40"
          style={{ background: 'linear-gradient(135deg, rgba(234,179,8,0.15), rgba(168,85,247,0.12))' }}>
          <p className="text-yellow-300 font-black text-lg tracking-widest mb-1">AREA CLEAR!</p>
          <p className="text-gray-400 text-xs">召喚チケット ×5 獲得！</p>
        </div>
      )}

      <div className="bg-black/50 border border-yellow-900/30 rounded-2xl p-4 mb-6 text-left">
        <p className="text-gray-400 text-xs font-bold mb-3 tracking-wide">━━ 獲得報酬 ━━━━━━━━━━━━━━━━</p>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-300 text-sm">💰 ゴールド</span>
          <span className="text-yellow-400 font-black text-lg">{gold.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-gray-300 text-sm">✨ 経験値</span>
          <span className="text-blue-400 font-black text-lg">{exp.toLocaleString()}</span>
        </div>
        {items.length > 0 && (
          <>
            <p className="text-gray-500 text-xs font-bold mb-2 tracking-wide">━━ ドロップアイテム ━━━━━━━━</p>
            {items.map((id, i) => {
              const m = getItemMaster(id);
              return m ? (
                <div key={i} className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{m.emoji}</span>
                  <span className="text-gray-200 text-sm">{m.name}</span>
                  <span className="text-green-400 text-xs font-bold ml-auto">GET</span>
                </div>
              ) : null;
            })}
          </>
        )}
      </div>

      {onAreaScenario && (
        <button onClick={onAreaScenario}
          className="w-full mb-3 py-3 rounded-2xl font-black text-sm tracking-wider transition-all active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            border: '1px solid rgba(167,139,250,0.4)',
            color: '#e9d5ff',
            boxShadow: '0 0 20px rgba(124,58,237,0.4)',
          }}>
          エリアクリアシナリオを見る ▶
        </button>
      )}

      <div className="flex gap-3">
        <GameButton variant="secondary" onClick={onHome} fullWidth>ホームへ</GameButton>
        <GameButton variant="primary" onClick={onQuest} fullWidth>クエストへ</GameButton>
      </div>
    </div>
  </div>
);

// ===== 敗北画面 =====
const DefeatScreen = ({ onHome, onQuest }: { onHome: () => void; onQuest: () => void }) => (
  <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center battle-bg">
    <div className="animate-slide-up w-full max-w-sm">
      <div style={{ fontSize: 72, marginBottom: 12, filter: 'drop-shadow(0 0 20px rgba(239,68,68,0.6))' }}>💀</div>
      <p className="text-red-400 font-black text-3xl tracking-widest mb-1">DEFEAT</p>
      <p className="text-gray-500 text-sm mb-8">全滅してしまいました…</p>

      <div className="bg-black/40 border border-red-900/30 rounded-2xl p-4 mb-6">
        <p className="text-gray-400 text-sm">ユニットを強化して再挑戦しましょう</p>
      </div>

      <div className="flex gap-3">
        <GameButton variant="secondary" onClick={onHome} fullWidth>ホームへ</GameButton>
        <GameButton variant="danger" onClick={onQuest} fullWidth>クエストへ</GameButton>
      </div>
    </div>
  </div>
);
