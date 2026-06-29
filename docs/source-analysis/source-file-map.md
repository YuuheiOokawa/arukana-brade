# アルカナブレイド ソースファイル別役割一覧

## プロジェクトルート

| ファイル | 役割 | 学習ポイント |
|----------|------|------------|
| `package.json` | 依存ライブラリ・スクリプト定義 | npm/プロジェクト管理の基本 |
| `vite.config.ts` | Viteビルド設定・PWA設定 | フロントエンドビルドツール |
| `vercel.json` | Vercelデプロイ設定（APIルーティング） | Serverlessデプロイ |
| `tsconfig.json` | TypeScript基本設定 | 型チェックの仕組み |
| `tsconfig.app.json` | フロントエンド用TypeScript設定 | |
| `tsconfig.api.json` | API用TypeScript設定 | |
| `tsconfig.node.json` | Node.js用TypeScript設定 | |

---

## lib/ （バックエンド共通ユーティリティ）

### `lib/auth.ts`
- **役割:** JWT生成・検証・Cookie管理
- **言語:** TypeScript
- **重要な関数:**
  - `generateToken(userId)` — JWT生成（30日有効）
  - `verifyToken(token)` — JWTの検証とデコード
  - `setAuthCookie(res, token)` — レスポンスにCookieをセット
  - `clearAuthCookie(res)` — Cookieを削除
  - `getTokenFromRequest(req)` — リクエストからJWT抽出
- **学習ポイント:** JWT認証・HTTP Cookie・セキュリティ

```typescript
// 例: JWT生成
const token = jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '30d' });
```

---

### `lib/prisma.ts`
- **役割:** Prisma Client のシングルトン管理
- **言語:** TypeScript
- **学習ポイント:** DB接続管理・シングルトンパターン

```typescript
// 例: シングルトンパターン
const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

---

### `lib/syncService.ts` (ルートlib/)
- **役割:** フロントエンド全ストアのDB同期サービス
- **重要な関数:**
  - `collectGameState()` — 全ストアからJSONを収集
  - `saveToServer(state)` — `/api/player/saveAll` に送信
  - `scheduleSave()` — 1.5秒デバウンスで自動保存予約
  - `saveImmediately()` — 即時保存
  - `initAutoSave()` — 全ストアのsubscribeを開始
  - `hydrateFromGameState(json)` — DBのJSONを全ストアに復元
- **学習ポイント:** デバウンス・Zustand subscribe・状態永続化

---

## prisma/

### `prisma/schema.prisma`
- **役割:** データベーススキーマ定義
- **テーブル:** User / Player / OwnedUnit / PlayerItem / SummonHistory
- **学習ポイント:** Prismaスキーマ文法・リレーション・マイグレーション

---

## api/auth/

### `api/auth/register.ts`
- **役割:** ユーザー登録API
- **関連DB:** User, Player
- **学習ポイント:** bcryptハッシュ・Prismaトランザクション・JWT発行

### `api/auth/login.ts`
- **役割:** ログインAPI
- **関連DB:** User, Player
- **学習ポイント:** bcrypt.compare・JWT認証フロー

### `api/auth/me.ts`
- **役割:** 現在のログインユーザー情報取得
- **関連DB:** Player（gameStateJson含む）
- **学習ポイント:** JWT検証・ゲームデータ復元の起点

### `api/auth/logout.ts`
- **役割:** ログアウト処理（Cookie削除）
- **学習ポイント:** Cookieの無効化

---

## api/player/

### `api/player/save.ts`
- **役割:** プロフィール情報の保存
- **関連DB:** Player
- **学習ポイント:** 部分更新（PATCH相当）・バリデーション

### `api/player/currency.ts`
- **役割:** 通貨・EXP・スタミナ数値の保存
- **関連DB:** Player
- **学習ポイント:** 数値バリデーション・Prisma update

### `api/player/saveAll.ts`
- **役割:** 全ゲーム状態の一括保存（JSON + 正規化カラム）
- **関連DB:** Player
- **学習ポイント:** JSONBカラムへの保存・Prismaトランザクション

---

## api/summon/

### `api/summon/save.ts`
- **役割:** ガチャ結果をDBに保存
- **関連DB:** OwnedUnit, SummonHistory, Player
- **学習ポイント:** `createMany` ・トランザクション・ゲームロジックとDB保存の分離

---

## api/units/

### `api/units/sync.ts`
- **役割:** ユニット全件を一括同期（削除→再作成）
- **関連DB:** OwnedUnit
- **学習ポイント:** 完全同期パターン・`deleteMany`+`createMany`

---

## src/main.tsx
- **役割:** Reactアプリのエントリーポイント
- **学習ポイント:** ReactDOM.createRoot・StrictMode

---

## src/App.tsx
- **役割:** ルートコンポーネント・ルーティング・認証ガード
- **重要な処理:**
  - 起動時に `checkAuth()` を実行（/api/auth/me）
  - 認証済みなら `hydrateFromGameState()` でゲームデータ復元
  - 自動保存 `initAutoSave()` を開始
  - `AuthGuard`: 未認証 → /title へリダイレクト
  - `MainGuard`: チュートリアル未完了 → /tutorial/intro へリダイレクト
- **学習ポイント:** React Router・useEffect・認証ガードパターン

---

## src/stores/ （Zustandストア）

### `authStore.ts`
- **役割:** 認証状態（user/player）管理
- **状態:** user, player, gameStateJson, isLoading, isChecked
- **重要メソッド:** checkAuth, setAuth, logout, syncCurrency, syncSummonResult

### `playerStore.ts`
- **役割:** プレイヤーデータ（通貨・スタミナ・アイテム）
- **状態:** player, items, lastUsedFriendId
- **重要メソッド:** addGold/spendGold, addDiamond, addExp（ランクアップ含）, recoverStamina（5分タイマー）
- **persist key:** `arcana-player`

### `unitStore.ts`
- **役割:** 所持ユニット管理（育成・覚醒・進化）
- **状態:** ownedUnits, awakeningCrystals
- **重要メソッド:** addUnit, levelUpUnit, awakenUnit, rarityUp, processSummonResults
- **persist key:** `arcana-units`

### `partyStore.ts`
- **役割:** パーティ編成
- **状態:** parties（最大5枠×複数パーティ）, activePartyId
- **重要メソッド:** setSlot（重複チェック付）, setLeader, getActiveParty
- **persist key:** `arcana-party`

### `questStore.ts`
- **役割:** クエスト進捗管理
- **状態:** clearedStageIds, pendingStageId/FriendId, claimedAreaRewards
- **persist key:** `arcana-quests`

### `tutorialStore.ts`
- **役割:** チュートリアル進行管理
- **状態:** completed, phase, playerName, selectedHeroId, selectedGender, selectedRace
- **persist key:** `arcana-tutorial`

### `equipmentStore.ts`
- **役割:** 装備品管理
- **persist key:** `arcana-equipment`

### `guildStore.ts`
- **役割:** ギルド情報管理
- **persist key:** `arcana-guild`

### `raidStore.ts`
- **役割:** レイド情報管理
- **persist key:** `arcana-raid`

### `arenaStore.ts`
- **役割:** アリーナ（PvP）記録管理
- **persist key:** `arcana-arena`

### `missionStore.ts`
- **役割:** デイリー/ウィークリーミッション進捗
- **persist key:** `arcana-mission`

### `loginBonusStore.ts`
- **役割:** ログインボーナス管理（30日サイクル）
- **persist key:** `arcana-loginbonus`

---

## src/types/index.ts
- **役割:** プロジェクト全体の型定義（TypeScript Interface/Type）
- **主な型:**
  - `UnitMaster` — マスターデータ型
  - `OwnedUnit` — 所持ユニット型
  - `PlayerData` — プレイヤーデータ型
  - `Skill`, `BattleState`, `PartyComposition` など

---

## src/utils/

### `battleEngine.ts`
- **役割:** バトルのダメージ計算・スキル効果処理
- **重要な関数:**
  - `calcDamage(atk, def, power, atkElement, defElement, atkBuffs, defBuffs)` — ダメージ計算
  - `executeSkillOnTargets()` — スキル効果の適用
- **属性相性テーブル:** ELEMENT_ADVANTAGE（6属性間の倍率）
- **学習ポイント:** ゲームロジック実装・純粋関数・ランダム要素

```typescript
// ダメージ計算例
const baseDmg = atk * power - def * 0.5;
const finalDmg = baseDmg * elementMult * (0.9 + Math.random() * 0.2);
```

### `elementUtils.ts`
- **役割:** 属性ごとのグラデーション色を返すユーティリティ
- **学習ポイント:** UI表示用のユーティリティ関数

### `format.ts`
- **役割:** 数値フォーマット（1500 → "1,500"など）

### `storage.ts`
- **役割:** localStorage の抽象化ユーティリティ

---

## src/lib/syncService.ts
- **役割:** フロントエンド側の同期サービス（lib/syncService.ts と同一）
- **学習ポイント:** src/lib/ 配下からimport可能なサービス層

---

## src/hooks/assets/

### `useAsset.ts`
- **役割:** アセット（画像URL）取得の基底フック
### `useBackground.ts`
- **役割:** 背景画像取得フック
### `useCharacterImage.ts`
- **役割:** キャラクター画像取得フック
### `useIcon.ts`
- **役割:** アイコン取得フック
### `useEffectImage.ts`
- **役割:** エフェクト画像取得フック

---

## src/data/ （マスターデータ）

| ファイル | 内容 |
|---------|------|
| `units.ts` | 全ユニットマスターデータ（70体以上） |
| `skills.ts` | 全スキル定義（40種以上） |
| `summons.ts` | ガチャプール定義（5種） |
| `rarityConfig.ts` | レアリティごとのレベル上限・進化コスト |
| `enemies.ts` | 敵キャラクター定義 |
| `quests.ts` | クエスト構成（ワールド→エリア→ステージ） |
| `items.ts` | アイテム定義 |
| `missions.ts` | ミッション定義 |
| `heroes.ts` | 主人公キャラクター選択肢 |
| `races.ts` | 種族定義 |
| `scenarios.ts` | シナリオテキスト |
| `equipments.ts` | 装備品定義 |
| `events.ts` | イベント定義 |
| `friends.ts` | フレンド候補データ |

---

## src/components/

### `layout/BottomNav.tsx`
- **役割:** 下部ナビゲーションバー
- **表示条件:** バトル・ログイン・チュートリアル画面以外
- **リンク:** ホーム / ユニット / パーティ / クエスト / その他

### `layout/TopBar.tsx`
- **役割:** 上部バー（スタミナ・ゴールド・ダイヤ表示）

### `ui/`
- **役割:** ボタン・カード・モーダル等の共通UIコンポーネント

---

## src/features/ （機能別コンポーネント）

| フォルダ | 主要画面・コンポーネント |
|---------|----------------------|
| `auth/` | RegisterPage（新規登録） |
| `login/` | LoginPage（ログイン） |
| `tutorial/` | TitleScreen, TutorialIntroScreen, PlayerNameInputScreen, HeroSelectScreen, TutorialBattleScreen, TutorialCompleteScreen, TutorialGachaScreen |
| `home/` | HomePage（メインホーム） |
| `units/` | UnitsPage（ユニット一覧）, UnitDetailPage（詳細・育成） |
| `party/` | PartyPage（パーティ編成） |
| `quests/` | QuestsPage（クエストマップ）, FriendSelectPage |
| `battle/` | BattlePage（ターン制バトル） |
| `summon/` | SummonPage（ガチャ） |
| `enhance/` | EnhancePage（強化・覚醒） |
| `items/` | ItemsPage（アイテム一覧） |
| `equipment/` | EquipmentPage（装備管理） |
| `missions/` | MissionsPage（ミッション） |
| `raid/` | RaidPage（レイド） |
| `guild/` | GuildPage（ギルド） |
| `pvp/` | PvPPage（アリーナ） |
| `profile/` | ProfilePage（プロフィール） |
| `shop/` | ShopPage（ショップ） |
| `scenario/` | ScenarioPage（シナリオ） |
| `friends/` | FriendsPage（フレンド） |
| `debug/` | DebugPage（開発者ツール） |
