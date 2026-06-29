import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuestStore } from '../../stores/questStore';
import { usePartyStore } from '../../stores/partyStore';
import { useUnitStore } from '../../stores/unitStore';
import { usePlayerStore } from '../../stores/playerStore';
import { useEquipmentStore } from '../../stores/equipmentStore';
import { useMissionStore } from '../../stores/missionStore';
import { getStage } from '../../data/quests';
import { getEventStage } from '../../data/events';
import { getEnemyMaster } from '../../data/enemies';
import { UNIT_MASTER, calcUnitStats } from '../../data/units';
import { FRIEND_CANDIDATES } from '../../data/friends';
import { getItemMaster } from '../../data/items';
import { calcEquipmentStats, getEquipmentMaster } from '../../data/equipments';
import { applyLeaderSkills } from '../../utils/battleEngine';
import { GameButton } from '../../components/ui/game/GameButton';
import type { BattleUnit, BattleEnemy, QuestStage, LeaderSkillEffect } from '../../types';

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
  const { pendingStageId, pendingFriendId, clearPending, markCleared, checkAreaComplete, claimAreaReward } = useQuestStore();
  const { getActiveParty } = usePartyStore();
  const { ownedUnits, levelUpUnit } = useUnitStore();
  const { spendStamina, addGold, addExp, addItem, syncCurrencyToServer } = usePlayerStore();
  const { getEquippedByUnit } = useEquipmentStore();
  const { addDailyProgress } = useMissionStore();

  const [allies, setAllies] = useState<BattleUnit[]>([]);
  const [enemies, setEnemies] = useState<BattleEnemy[]>([]);
  const [stage, setStage] = useState<QuestStage | null>(null);
  const [waveIndex, setWaveIndex] = useState(0);
  const [round, setRound] = useState(1);
  const [logs, setLogs] = useState<string[]>([]);
  const [logQueue, setLogQueue] = useState<string[]>([]);
  const isLogAnimatingRef = useRef(false);
  const [phase, setPhase] = useState<Phase>('battle');
  const [leaderBbGauge, setLeaderBbGauge] = useState(0);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [rewardGold, setRewardGold] = useState(0);
  const [rewardExp, setRewardExp] = useState(0);
  const [rewardItems, setRewardItems] = useState<string[]>([]);

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
    const s = getStage(pendingStageId) ?? getEventStage(pendingStageId);
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
    }, 80);
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

            // --- 味方フェーズ ---
            if (isSkillTurn) {
              // リーダースキル: 全敵に2-3倍ダメージ
              const multiplier = 2 + Math.random();
              const skillDmgPerEnemy = updEnemies.map(enemy => {
                if (enemy.currentHp <= 0) return 0;
                const base = Math.max(1, Math.floor(leader.atk * (0.8 + Math.random() * 0.4) - enemy.def * 0.3));
                return Math.floor(base * multiplier);
              });
              let totalDmg = 0;
              updEnemies = updEnemies.map((enemy, idx) => {
                const dmg = skillDmgPerEnemy[idx];
                if (dmg === 0) return enemy;
                totalDmg += dmg;
                const newHp = Math.max(0, enemy.currentHp - dmg);
                return { ...enemy, currentHp: newHp };
              });
              newLines.push(`✨ ${leader.emoji} ${leader.name} のスキル発動！全体に ${totalDmg.toLocaleString()} ダメージ！`);
              // 撃破チェック
              updEnemies.forEach(e => {
                if (e.currentHp <= 0 && curEnemies.find(ce => ce.instanceId === e.instanceId)!.currentHp > 0) {
                  newLines.push(`💀 ${e.name} を撃破！`);
                }
              });

              // 他の味方は通常攻撃
              for (let i = 1; i < liveAllies.length; i++) {
                const ally = liveAllies[i];
                const targets = updEnemies.filter(e => e.currentHp > 0);
                if (targets.length === 0) break;
                const target = targets.reduce((a, b) => a.currentHp < b.currentHp ? a : b);
                const dmg = Math.max(1, Math.floor(ally.atk * (0.8 + Math.random() * 0.4) - target.def * 0.3));
                const isCrit = Math.random() < 0.1;
                const finalDmg = isCrit ? Math.floor(dmg * 1.5) : dmg;
                const tIdx = updEnemies.findIndex(e => e.instanceId === target.instanceId);
                const prevHp = updEnemies[tIdx].currentHp;
                updEnemies[tIdx] = { ...updEnemies[tIdx], currentHp: Math.max(0, prevHp - finalDmg) };
                if (isCrit) {
                  newLines.push(`💥 ${ally.emoji} ${ally.name} のクリティカル！ ${target.name} に ${finalDmg.toLocaleString()} の大ダメージ！`);
                } else {
                  newLines.push(`⚔️ ${ally.emoji} ${ally.name} → ${target.name} に ${finalDmg.toLocaleString()} ダメージ！`);
                }
                if (updEnemies[tIdx].currentHp <= 0 && prevHp > 0) {
                  newLines.push(`💀 ${target.name} を撃破！`);
                }
              }

              // BBゲージをリセット
              const nextBb = 0;

              // 敵フェーズ
              const liveEnemiesAfterAlly = updEnemies.filter(e => e.currentHp > 0);
              if (liveEnemiesAfterAlly.length > 0) {
                liveEnemiesAfterAlly.forEach(enemy => {
                  const aliveAlliesNow = updAllies.filter(a => a.currentHp > 0);
                  if (aliveAlliesNow.length === 0) return;
                  const randTarget = aliveAlliesNow[Math.floor(Math.random() * aliveAlliesNow.length)];
                  const dmg = Math.max(1, Math.floor(enemy.atk * (0.8 + Math.random() * 0.4) - randTarget.def * 0.3));
                  const aIdx = updAllies.findIndex(a => a.instanceId === randTarget.instanceId);
                  const prevHp2 = updAllies[aIdx].currentHp;
                  updAllies[aIdx] = { ...updAllies[aIdx], currentHp: Math.max(0, prevHp2 - dmg) };
                  newLines.push(`🔴 ${enemy.emoji} ${enemy.name} → ${randTarget.name} に ${dmg.toLocaleString()} ダメージ！`);
                  if (updAllies[aIdx].currentHp <= 0 && prevHp2 > 0) {
                    newLines.push(`😵 ${randTarget.name} が倒れた...`);
                  }
                });
              }

              addLogs(newLines);

              // 勝敗判定（setStage経由で参照）
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
                    const gold = curStage.rewardGold;
                    const exp = curStage.rewardExp;
                    const items: string[] = [];
                    curStage.rewardItems.forEach(ri => {
                      if (Math.random() < ri.chance) {
                        for (let i = 0; i < ri.quantity; i++) items.push(ri.itemId);
                      }
                    });
                    setRewardGold(gold);
                    setRewardExp(exp);
                    setRewardItems(items);
                    const isAreaClear = checkAreaComplete(curStage.id);
                    markCleared(curStage.id);
                    clearPending();
                    addGold(gold);
                    addExp(exp);
                    items.forEach(id => addItem(id, 1));
                    if (isAreaClear) {
                      const parts = curStage.id.split('_');
                      if (parts.length >= 3) claimAreaReward(`${parts[1]}_${parts[2]}`);
                      addItem('item_summon_ticket', 5);
                    }
                    const nonFriendAlive = updAllies.filter(a => !a.isFriend && a.currentHp > 0);
                    const nonFriendCount = updAllies.filter(a => !a.isFriend).length || 1;
                    nonFriendAlive.forEach(a => levelUpUnit(a.instanceId, Math.floor(exp / nonFriendCount)));
                    addDailyProgress('battle_win');
                    addDailyProgress('quest_clear');
                    if (updAllies.some(a => a.isFriend && a.currentHp > 0)) {
                      addDailyProgress('friend_battle');
                    }
                    setTimeout(() => void syncCurrencyToServer(), 500);
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
            } else {
              // --- 通常攻撃ラウンド ---
              liveAllies.forEach(ally => {
                const targets = updEnemies.filter(e => e.currentHp > 0);
                if (targets.length === 0) return;
                const target = targets.reduce((a, b) => a.currentHp < b.currentHp ? a : b);
                const dmg = Math.max(1, Math.floor(ally.atk * (0.8 + Math.random() * 0.4) - target.def * 0.3));
                const isCrit = Math.random() < 0.1;
                const finalDmg = isCrit ? Math.floor(dmg * 1.5) : dmg;
                const tIdx = updEnemies.findIndex(e => e.instanceId === target.instanceId);
                const prevHp = updEnemies[tIdx].currentHp;
                updEnemies[tIdx] = { ...updEnemies[tIdx], currentHp: Math.max(0, prevHp - finalDmg) };
                if (isCrit) {
                  newLines.push(`💥 ${ally.emoji} ${ally.name} のクリティカル！ ${target.name} に ${finalDmg.toLocaleString()} の大ダメージ！`);
                } else {
                  newLines.push(`⚔️ ${ally.emoji} ${ally.name} → ${target.name} に ${finalDmg.toLocaleString()} ダメージ！`);
                }
                if (updEnemies[tIdx].currentHp <= 0 && prevHp > 0) {
                  newLines.push(`💀 ${target.name} を撃破！`);
                }
              });

              // 敵フェーズ
              const liveEnemiesAfterAlly = updEnemies.filter(e => e.currentHp > 0);
              if (liveEnemiesAfterAlly.length > 0) {
                liveEnemiesAfterAlly.forEach(enemy => {
                  const aliveAlliesNow = updAllies.filter(a => a.currentHp > 0);
                  if (aliveAlliesNow.length === 0) return;
                  const randTarget = aliveAlliesNow[Math.floor(Math.random() * aliveAlliesNow.length)];
                  const dmg = Math.max(1, Math.floor(enemy.atk * (0.8 + Math.random() * 0.4) - randTarget.def * 0.3));
                  const aIdx = updAllies.findIndex(a => a.instanceId === randTarget.instanceId);
                  const prevHp2 = updAllies[aIdx].currentHp;
                  updAllies[aIdx] = { ...updAllies[aIdx], currentHp: Math.max(0, prevHp2 - dmg) };
                  newLines.push(`🔴 ${enemy.emoji} ${enemy.name} → ${randTarget.name} に ${dmg.toLocaleString()} ダメージ！`);
                  if (updAllies[aIdx].currentHp <= 0 && prevHp2 > 0) {
                    newLines.push(`😵 ${randTarget.name} が倒れた...`);
                  }
                });
              }

              // BBゲージ増加
              const nextBb = Math.min(100, curBb + 20);

              addLogs(newLines);

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
                    const gold = curStage.rewardGold;
                    const exp = curStage.rewardExp;
                    const items: string[] = [];
                    curStage.rewardItems.forEach(ri => {
                      if (Math.random() < ri.chance) {
                        for (let i = 0; i < ri.quantity; i++) items.push(ri.itemId);
                      }
                    });
                    setRewardGold(gold);
                    setRewardExp(exp);
                    setRewardItems(items);
                    const isAreaClear = checkAreaComplete(curStage.id);
                    markCleared(curStage.id);
                    clearPending();
                    addGold(gold);
                    addExp(exp);
                    items.forEach(id => addItem(id, 1));
                    if (isAreaClear) {
                      const parts = curStage.id.split('_');
                      if (parts.length >= 3) claimAreaReward(`${parts[1]}_${parts[2]}`);
                      addItem('item_summon_ticket', 5);
                    }
                    const nonFriendAlive = updAllies.filter(a => !a.isFriend && a.currentHp > 0);
                    const nonFriendCount = updAllies.filter(a => !a.isFriend).length || 1;
                    nonFriendAlive.forEach(a => levelUpUnit(a.instanceId, Math.floor(exp / nonFriendCount)));
                    addDailyProgress('battle_win');
                    addDailyProgress('quest_clear');
                    if (updAllies.some(a => a.isFriend && a.currentHp > 0)) {
                      addDailyProgress('friend_battle');
                    }
                    setTimeout(() => void syncCurrencyToServer(), 500);
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
            }
          });
          return curRound;
        });
        return curEnemies;
      });
      return curAllies;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, waveIndex, addLogs, buildWave]);

  // オートモード
  useEffect(() => {
    if (!isAutoMode || phase !== 'battle') return;
    const timer = setTimeout(() => processRound(false), 1000);
    return () => clearTimeout(timer);
  }, [isAutoMode, phase, round, processRound]);

  if (!stage) return (
    <div className="min-h-screen flex items-center justify-center battle-bg">
      <p className="text-purple-300 animate-pulse">読み込み中...</p>
    </div>
  );

  if (phase === 'victory') {
    return <VictoryScreen
      stageName={stage.name}
      round={round}
      gold={rewardGold}
      exp={rewardExp}
      items={rewardItems}
      onHome={() => navigate('/')}
      onQuest={() => navigate('/quests')}
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
          <p className="text-purple-400 text-xs font-medium tracking-wide">{stage.name}</p>
          <p className="text-white text-xs font-bold">
            Round <span className="text-purple-300">{round}</span>
            <span className="text-gray-600 mx-1">|</span>
            Wave <span className="text-purple-300">{waveIndex + 1}</span>
            <span className="text-gray-500">/{stage.waves.length}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
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
                <span className="text-base w-6 text-center">{a.emoji}</span>
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
  stageName, round, gold, exp, items, onHome, onQuest,
}: {
  stageName: string; round: number; gold: number; exp: number; items: string[];
  onHome: () => void; onQuest: () => void;
}) => (
  <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center battle-bg">
    <div className="animate-slide-up w-full max-w-sm">
      <div style={{ fontSize: 72, marginBottom: 12, filter: 'drop-shadow(0 0 24px rgba(240,192,64,0.7))' }}>🏆</div>
      <p className="text-yellow-400 font-black text-3xl tracking-widest mb-1">VICTORY!</p>
      <p className="text-gray-500 text-xs mb-1">{stageName}</p>
      <p className="text-purple-400 text-xs mb-6">クリアラウンド: {round}</p>

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
