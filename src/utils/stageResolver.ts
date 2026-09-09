import { getStage } from '../data/quests';
import { getEventStage, getRaidStage } from '../data/events';

/** Resolve every playable stage type through one shared entry point. */
export const resolvePlayableStage = (stageId: string) =>
  getStage(stageId) ?? getEventStage(stageId) ?? getRaidStage(stageId) ?? null;
