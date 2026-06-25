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

  setPhase: (phase: TutorialPhase) => void;
  setPlayerName: (name: string) => void;
  selectGender: (gender: GenderType) => void;
  selectRace: (race: RaceType) => void;
  selectHero: (heroId: string) => void;
  completeTutorial: () => void;
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

      setPhase: (phase) => set({ phase }),
      setPlayerName: (playerName) => set({ playerName }),
      selectGender: (gender) => set({ selectedGender: gender }),
      selectRace: (race) => set({ selectedRace: race }),
      selectHero: (heroId) => set({ selectedHeroId: heroId }),
      completeTutorial: () => set({ completed: true, phase: 'complete' }),
      resetTutorial: () => set({
        completed: false,
        phase: 'title',
        playerName: '',
        selectedHeroId: null,
        selectedGender: null,
        selectedRace: null,
      }),
    }),
    { name: 'arcana-tutorial' }
  )
);
