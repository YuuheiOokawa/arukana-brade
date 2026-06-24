// ローカルストレージのキー管理と将来のバックエンド移行のための抽象化レイヤー

export const STORAGE_KEYS = {
  PLAYER: 'arcana-player',
  UNITS: 'arcana-units',
  PARTY: 'arcana-party',
  QUESTS: 'arcana-quests',
} as const;

// 将来的にはここをAPIコールに置き換える
export const saveData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    console.warn('LocalStorage save failed');
  }
};

export const loadData = <T>(key: string, defaultValue: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
};

export const clearAllData = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
};
