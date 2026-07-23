import type {
  BattleUnit, BattleEnemy, BattleLog, SkillMaster, StatusEffect, ElementType, LeaderSkillEffect,
} from '../types';
import { ELEMENT_ADVANTAGE } from '../types';
import { getSkill } from '../data/skills';

export type BattleActor = BattleUnit | BattleEnemy;

export interface BattleResult {
  updatedAllies: BattleUnit[];
  updatedEnemies: BattleEnemy[];
  logs: BattleLog[];
}

const getElementMultiplier = (atkElement: ElementType, defElement: ElementType): number => {
  return ELEMENT_ADVANTAGE[atkElement]?.[defElement] ?? 1.0;
};

const applyBuffs = (stat: number, buffs: StatusEffect[], type: StatusEffect['type']): number => {
  const buff = buffs.find(b => b.type === type);
  return buff ? Math.floor(stat * buff.power) : stat;
};

export const calcDamage = (
  atk: number,
  def: number,
  power: number,
  atkElement: ElementType,
  defElement: ElementType,
  atkBuffs: StatusEffect[],
  defBuffs: StatusEffect[]
): { damage: number; elementBonus: boolean } => {
  const buffedAtk = applyBuffs(atk, atkBuffs, 'buff_atk');
  const debuffedAtk = applyBuffs(buffedAtk, atkBuffs, 'debuff_atk');
  const buffedDef = applyBuffs(def, defBuffs, 'buff_def');
  const debuffedDef = applyBuffs(buffedDef, defBuffs, 'debuff_def');

  const elementMult = getElementMultiplier(atkElement, defElement);
  const elementBonus = elementMult > 1;

  const baseDamage = Math.max(1, debuffedAtk * power - debuffedDef * 0.5);
  const finalDamage = Math.floor(baseDamage * elementMult * (0.9 + Math.random() * 0.2));

  return { damage: finalDamage, elementBonus };
};

export const calcHeal = (rec: number, power: number, buffs: StatusEffect[] = []): number => {
  const buffedRec = applyBuffs(rec, buffs, 'buff_rec');
  return Math.floor(buffedRec * power * (0.9 + Math.random() * 0.2));
};

export const executeSkillOnTargets = (
  actor: BattleActor,
  skill: SkillMaster,
  allies: BattleUnit[],
  enemies: BattleEnemy[],
  turn: number
): BattleResult => {
  const logs: BattleLog[] = [];
  let updatedAllies = [...allies];
  let updatedEnemies = [...enemies];

  const actorElement = actor.element;
  const actorAtk = 'isFriend' in actor ? actor.atk : actor.atk;
  const actorRec = 'rec' in actor ? (actor as BattleUnit).rec : 0;
  const actorBuffs = actor.buffs;

  const effectLogs: BattleLog = {
    turn,
    actorName: actor.name,
    action: skill.bbCost > 0 ? 'bb_skill' : 'skill',
    targetNames: [],
  };

  for (const effect of skill.effects) {
    const skillElement = skill.element ?? actorElement;

    if (effect.type === 'damage') {
      const targets = skill.target === 'single_enemy'
        ? [enemies.find(e => e.currentHp > 0)].filter(Boolean) as BattleEnemy[]
        : enemies.filter(e => e.currentHp > 0);

      for (const target of targets) {
        const { damage, elementBonus } = calcDamage(
          actorAtk, target.def, effect.power, skillElement, target.element, actorBuffs, target.buffs
        );
        updatedEnemies = updatedEnemies.map(e =>
          e.instanceId === target.instanceId
            ? { ...e, currentHp: Math.max(0, e.currentHp - damage) }
            : e
        );
        effectLogs.damage = (effectLogs.damage ?? 0) + damage;
        effectLogs.elementBonus = elementBonus;
        effectLogs.targetNames = [...effectLogs.targetNames, target.name];
      }
    } else if (effect.type === 'heal') {
      const healAmount = calcHeal(actorRec, effect.power, actorBuffs);
      const targets = skill.target === 'self'
        ? [allies.find(a => a.instanceId === actor.instanceId && a.currentHp > 0)].filter(Boolean) as BattleUnit[]
        : skill.target === 'single_ally'
        ? [allies.find(a => a.currentHp > 0 && a.currentHp < a.maxHp)].filter(Boolean) as BattleUnit[]
        : allies.filter(a => a.currentHp > 0);

      for (const target of targets) {
        const healed = Math.min(healAmount, target.maxHp - target.currentHp);
        updatedAllies = updatedAllies.map(a =>
          a.instanceId === target.instanceId
            ? { ...a, currentHp: Math.min(a.maxHp, a.currentHp + healAmount) }
            : a
        );
        effectLogs.heal = (effectLogs.heal ?? 0) + healed;
        effectLogs.targetNames = [...effectLogs.targetNames, target.name];
      }
    } else if (['buff_atk', 'buff_def', 'buff_rec', 'debuff_atk', 'debuff_def'].includes(effect.type)) {
      const isDebuff = effect.type.startsWith('debuff');
      const targets = isDebuff
        ? enemies.filter(e => e.currentHp > 0)
        : skill.target === 'self'
        ? allies.filter(a => a.instanceId === actor.instanceId && a.currentHp > 0)
        : allies.filter(a => a.currentHp > 0);

      // ラウンド終了時に毎回1ずつ減算されるため、+1しておくことで「Nラウンド分、丸々効果が持続する」を保証する
      // (そうしないと付与された直後のラウンド終了処理で即座に1消費され、実質 duration-1 ラウンドしか続かない)
      const newEffect: StatusEffect = {
        type: effect.type as StatusEffect['type'],
        power: effect.power,
        remainingTurns: (effect.duration ?? 2) + 1,
      };

      if (isDebuff) {
        updatedEnemies = updatedEnemies.map(e =>
          targets.some(t => t.instanceId === e.instanceId)
            ? { ...e, buffs: [...e.buffs.filter(b => b.type !== effect.type), newEffect] }
            : e
        );
      } else {
        updatedAllies = updatedAllies.map(a =>
          targets.some(t => t.instanceId === a.instanceId)
            ? { ...a, buffs: [...a.buffs.filter(b => b.type !== effect.type), newEffect] }
            : a
        );
      }
      effectLogs.targetNames = targets.map(t => t.name);
    }
  }

  logs.push(effectLogs);
  return { updatedAllies, updatedEnemies, logs };
};

export const executeNormalAttack = (
  actor: BattleUnit,
  enemies: BattleEnemy[],
  allies: BattleUnit[],
  turn: number
): BattleResult => {
  const target = enemies.find(e => e.currentHp > 0);
  if (!target) return { updatedAllies: allies, updatedEnemies: enemies, logs: [] };

  const { damage, elementBonus } = calcDamage(
    actor.atk, target.def, 1.0, actor.element, target.element, actor.buffs, target.buffs
  );

  const updatedEnemies = enemies.map(e =>
    e.instanceId === target.instanceId
      ? { ...e, currentHp: Math.max(0, e.currentHp - damage) }
      : e
  );

  // BBゲージ増加
  const updatedAllies = allies.map(a =>
    a.instanceId === actor.instanceId
      ? { ...a, bbGauge: Math.min(100, a.bbGauge + 20) }
      : a
  );

  const log: BattleLog = {
    turn,
    actorName: actor.name,
    action: 'normal_attack',
    targetNames: [target.name],
    damage,
    elementBonus,
  };

  return { updatedAllies, updatedEnemies, logs: [log] };
};

export const executeEnemyTurn = (
  enemy: BattleEnemy,
  allies: BattleUnit[],
  enemies: BattleEnemy[],
  turn: number
): BattleResult => {
  const livingAllies = allies.filter(a => a.currentHp > 0);
  if (livingAllies.length === 0) return { updatedAllies: allies, updatedEnemies: enemies, logs: [] };

  const useSkill = enemy.skillId && Math.random() < 0.3;
  const skill = useSkill ? getSkill(enemy.skillId!) : null;

  // 敵スキル: プレイヤー側ユニット(allies)を直接ターゲット
  // executeSkillOnTargets は BattleEnemy[] を攻撃対象とするため敵には転用不可
  if (skill && skill.effects.length > 0) {
    const isAoe = skill.target === 'all_enemies' || skill.target === 'all_allies';
    const targets = isAoe
      ? livingAllies
      : [livingAllies[Math.floor(Math.random() * livingAllies.length)]];

    let updatedAllies = [...allies];
    let updatedSelf = enemy;
    let totalDamage = 0;
    let hasElementBonus = false;
    const targetNames: string[] = [];

    for (const effect of skill.effects) {
      if (effect.type === 'damage') {
        for (const t of targets) {
          const { damage, elementBonus } = calcDamage(
            enemy.atk, t.def, effect.power, enemy.element, t.element, updatedSelf.buffs, t.buffs
          );
          updatedAllies = updatedAllies.map(a =>
            a.instanceId === t.instanceId
              ? { ...a, currentHp: Math.max(0, a.currentHp - damage), bbGauge: Math.min(100, a.bbGauge + 10) }
              : a
          );
          totalDamage += damage;
          hasElementBonus = hasElementBonus || elementBonus;
          if (!targetNames.includes(t.name)) targetNames.push(t.name);
        }
      } else if (effect.type === 'debuff_atk' || effect.type === 'debuff_def') {
        // プレイヤー側ユニットを弱体化（duration+1 は executeSkillOnTargets と同じ理由）
        const newEffect: StatusEffect = { type: effect.type, power: effect.power, remainingTurns: (effect.duration ?? 2) + 1 };
        updatedAllies = updatedAllies.map(a =>
          targets.some(t => t.instanceId === a.instanceId)
            ? { ...a, buffs: [...a.buffs.filter(b => b.type !== effect.type), newEffect] }
            : a
        );
        targets.forEach(t => { if (!targetNames.includes(t.name)) targetNames.push(t.name); });
      } else if (effect.type === 'buff_atk' || effect.type === 'buff_def' || effect.type === 'buff_rec') {
        // 敵自身を強化（このゲームには敵チーム全体バフの概念がないため自己バフとして扱う）
        const newEffect: StatusEffect = { type: effect.type, power: effect.power, remainingTurns: (effect.duration ?? 2) + 1 };
        updatedSelf = { ...updatedSelf, buffs: [...updatedSelf.buffs.filter(b => b.type !== effect.type), newEffect] };
      }
    }

    const updatedEnemies = enemies.map(e => e.instanceId === enemy.instanceId ? updatedSelf : e);
    const log: BattleLog = {
      turn,
      actorName: enemy.name,
      action: 'skill',
      targetNames,
      damage: totalDamage,
      elementBonus: hasElementBonus,
    };
    return { updatedAllies, updatedEnemies, logs: [log] };
  }

  // 通常攻撃
  const target = livingAllies[Math.floor(Math.random() * livingAllies.length)];
  const { damage, elementBonus } = calcDamage(
    enemy.atk, target.def, 1.0, enemy.element, target.element, enemy.buffs, target.buffs
  );

  const updatedAllies = allies.map(a =>
    a.instanceId === target.instanceId
      ? { ...a, currentHp: Math.max(0, a.currentHp - damage), bbGauge: Math.min(100, a.bbGauge + 10) }
      : a
  );

  const log: BattleLog = {
    turn,
    actorName: enemy.name,
    action: 'normal_attack',
    targetNames: [target.name],
    damage,
    elementBonus,
  };

  return { updatedAllies, updatedEnemies: enemies, logs: [log] };
};

/**
 * リーダースキルをバトル開始時の味方全体に適用する。
 * 自軍リーダー + フレンドリーダーの両方を順番に適用。
 */
export const applyLeaderSkills = (
  allies: BattleUnit[],
  effects: LeaderSkillEffect[]
): BattleUnit[] => {
  if (effects.length === 0) return allies;
  return allies.map(ally => {
    let { atk, def, rec, maxHp, currentHp } = ally;
    for (const effect of effects) {
      if (effect.target !== 'all' && effect.target !== ally.element) continue;
      switch (effect.stat) {
        case 'atk': atk = Math.floor(atk * effect.multiplier); break;
        case 'def': def = Math.floor(def * effect.multiplier); break;
        case 'rec': rec = Math.floor(rec * effect.multiplier); break;
        case 'hp': {
          const ratio = currentHp / maxHp;
          maxHp = Math.floor(maxHp * effect.multiplier);
          currentHp = Math.floor(maxHp * ratio);
          break;
        }
      }
    }
    return { ...ally, atk, def, rec, maxHp, currentHp };
  });
};

export const tickBuffs = (allies: BattleUnit[], enemies: BattleEnemy[]): { allies: BattleUnit[]; enemies: BattleEnemy[] } => {
  const tickBuffsOnUnit = <T extends { buffs: StatusEffect[] }>(units: T[]): T[] =>
    units.map(u => ({
      ...u,
      buffs: u.buffs
        .map(b => ({ ...b, remainingTurns: b.remainingTurns - 1 }))
        .filter(b => b.remainingTurns > 0),
    }));

  return {
    allies: tickBuffsOnUnit(allies),
    enemies: tickBuffsOnUnit(enemies),
  };
};
