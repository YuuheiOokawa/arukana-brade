// 管理用アカウントの判定。App.tsx/TitleScreen.tsx の setAdminMode 適用条件と
// 同じ基準を他の機能(アリーナの管理用ランク早送り等)からも再利用するための共通箇所。
export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL ?? 'yuuheiookawa@gmail.com';

export const isAdminEmail = (email?: string | null): boolean => !!email && email === ADMIN_EMAIL;
