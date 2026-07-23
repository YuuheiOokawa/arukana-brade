import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GenderType, RaceType, TutorialPhase } from '../types';

interface TutorialStore {
  completed: boolean;
  phase: TutorialPhase;
  playerName: string;
  selectedHeroId: string | null;
  selectedGender: GenderType | null;
  selectedRace: RaceType | null;
  // 主人公ユニット付与・初回無料10連ガチャが実行済みかどうか（永続化）。
  // これがないと、完了前に画面をリロード/戻る操作で再訪問した際に
  // 主人公ユニットや無料ガチャの結果を何度でも farming できてしまう
  initialGachaDone: boolean;

  setPhase: (phase: TutorialPhase) => void;
  setPlayerName: (name: string) => void;
  selectGender: (gender: GenderType) => void;
  selectRace: (race: RaceType) => void;
  selectHero: (heroId: string) => void;
  setInitialGachaDone: (done: boolean) => void;
  completeTutorial: () => void;
  forceComplete: () => void;
  resetTutorial: () => void;
}

export const useTutorialStore = create<TutorialStore>()(
  persist(
    (set) => ({
      completed: false,
      phase: 'title',
      playerName: '',
      selectedHeroId: null,
      selectedGender: null,
      selectedRace: null,
      initialGachaDone: false,

      setPhase: (phase) => set({ phase }),
      setPlayerName: (playerName) => set({ playerName }),
      selectGender: (gender) => set({ selectedGender: gender }),
      selectRace: (race) => set({ selectedRace: race }),
      selectHero: (heroId) => set({ selectedHeroId: heroId }),
      setInitialGachaDone: (initialGachaDone) => set({ initialGachaDone }),
      completeTutorial: () => set({ completed: true, phase: 'complete' }),
      forceComplete: () => set({ completed: true, phase: 'complete' }),
      resetTutorial: () => set({
        completed: false,
        phase: 'title',
        playerName: '',
        selectedHeroId: null,
        selectedGender: null,
        selectedRace: null,
        initialGachaDone: false,
      }),
    }),
    { name: 'arcana-tutorial' }
  )
);
