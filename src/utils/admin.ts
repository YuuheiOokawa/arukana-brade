// 管理用アカウントの判定。App.tsx/TitleScreen.tsx の setAdminMode 適用条件と
// 同じ基準を他の機能(アリーナの管理用ランク早送り等)からも再利用するための共通箇所。
// VITE_ADMIN_EMAIL はビルド時に環境変数から明示的に設定する必要がある。
// 個人のメールアドレスをフォールバック値としてハードコードすると、ビルド成果物の
// JSに平文で埋め込まれ誰でも閲覧できてしまうため、未設定の場合は管理者判定を
// 常にfalseとする（フォールバックしない）。
export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL as string | undefined;

export const isAdminEmail = (email?: string | null): boolean => !!ADMIN_EMAIL && !!email && email === ADMIN_EMAIL;
