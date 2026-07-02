import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuestStore } from '../../stores/questStore';
import { usePartyStore } from '../../stores/partyStore';
import { useUnitStore } from '../../stores/unitStore';
import { getStage } from '../../data/quests';
import { getEnemyMaster } from '../../data/enemies';
import { UNIT_MASTER, calcUnitStats } from '../../data/units';
import { FRIEND_CANDIDATES } from '../../data/friends';
import type { BattleUnit, BattleEnemy } from '../../types';

let idCounter = 0;
const uid = () => `bid_${Date.now()}_${idCounter++}`;

export const useBattleSetup = () => {
  const navigate = useNavigate();
  const { pendingStageId, pendingFriendId, clearPending } = useQuestStore();
  const { getActiveParty } = usePartyStore();
  const { ownedUnits } = useUnitStore();
  useRef(false);

  const buildBattleData = () => {
    if (!pendingStageId) return null;
    const stage = getStage(pendingStageId);
    if (!stage) return null;

    const party = getActiveParty();
    const friendCandidate = pendingFriendId
      ? FRIEND_CANDIDATES.find(f => f.friendId === pendingFriendId)
      : null;

    // 味方ユニット構築
    const allies: BattleUnit[] = party.slots
      .filter(Boolean)
      .map(instanceId => {
        const owned = ownedUnits.find(u => u.instanceId === instanceId);
        if (!owned) return null;
        const master = UNIT_MASTER.find(m => m.id === owned.masterId);
        if (!master) return null;
        const stats = calcUnitStats(master, owned.level, owned.awakenRank);
        return {
          instanceId: owned.instanceId,
          masterId: master.id,
          name: master.name,
          element: master.element,
          currentRarity: Number(owned.currentRarity) || 1,
          currentHp: stats.hp,
          maxHp: stats.hp,
          atk: stats.atk,
          def: stats.def,
          rec: stats.rec,
          bbGauge: 0,
          skillId: master.skillId,
          bbSkillId: master.bbSkillId,
          isFriend: false,
          isAlly: true as const,
          buffs: [],
          emoji: master.emoji,
        } satisfies BattleUnit;
      })
      .filter(Boolean) as BattleUnit[];

    // フレンドユニット追加
    if (friendCandidate) {
      const friendMaster = UNIT_MASTER.find(m => m.id === friendCandidate.leaderUnitMasterId);
      if (friendMaster) {
        const stats = calcUnitStats(friendMaster, friendCandidate.leaderUnitLevel, friendCandidate.leaderUnitAwakenRank);
        allies.push({
          instanceId: `friend_${friendCandidate.friendId}`,
          masterId: friendMaster.id,
          name: `${friendCandidate.playerName}の${friendMaster.name}`,
          element: friendMaster.element,
          currentRarity: 1,
          currentHp: stats.hp,
          maxHp: stats.hp,
          atk: stats.atk,
          def: stats.def,
          rec: stats.rec,
          bbGauge: 0,
          skillId: friendMaster.skillId,
          bbSkillId: friendMaster.bbSkillId,
          isFriend: true,
          isAlly: true,
          buffs: [],
          emoji: friendMaster.emoji,
        });
      }
    }

    // 第1ウェーブの敵を構築
    const firstWave = stage.waves[0];
    const enemies: BattleEnemy[] = firstWave.enemies.map(e => {
      const master = getEnemyMaster(e.enemyId);
      if (!master) return null;
      const lvMult = 1 + (e.level - 1) * 0.1;
      return {
        instanceId: uid(),
        masterId: master.id,
        name: `${master.name} Lv.${e.level}`,
        element: master.element,
        currentHp: Math.floor(master.stats.hp * lvMult),
        maxHp: Math.floor(master.stats.hp * lvMult),
        atk: Math.floor(master.stats.atk * lvMult),
        def: Math.floor(master.stats.def * lvMult),
        skillId: master.skillId,
        isAlly: false as const,
        buffs: [],
        emoji: master.emoji,
      } satisfies BattleEnemy;
    }).filter(Boolean) as BattleEnemy[];

    return { allies, enemies, stage, waveIndex: 0 };
  };

  return { buildBattleData, clearPending, navigate, pendingStageId };
};
