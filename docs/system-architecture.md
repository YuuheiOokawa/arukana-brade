# システムアーキテクチャドキュメント
# アルカナブレイド

最終更新: 2026-06-25
バージョン: MVP 6.0 (Auth)

---

## 1. 技術構成

| 技術 | バージョン | 役割 |
|------|------------|------|
| React | 19.x | UIフレームワーク |
| TypeScript | 6.x | 型安全 |
| Vite | 8.x | ビルドツール・開発サーバー |
| Tailwind CSS v4 | 4.x | スタイリング (@tailwindcss/vite) |
| Zustand | 5.x | クライアント状態管理 |
| React Router v7 | 7.x | SPA ルーティング |
| localStorage | — | ゲームデータ永続化 (Zustand persist) |
| vite-plugin-pwa | 1.x | PWA・Service Worker 生成 ✅ |
| **Neon PostgreSQL** | — | **クラウドDB (認証・プレイヤーデータ)** |
| **Prisma ORM** | 5.x | **DBアクセス・スキーマ管理** |
| **bcryptjs** | 3.x | **パスワードハッシュ化** |
| **jsonwebtoken** | 9.x | **JWT認証トークン生成・検証** |
| **cookie** | 1.x | **HTTP Only Cookie管理** |
| **Vercel Functions** | — | **サーバーレスAPIエンドポイント** |
| **Vercel** | — | **ホスティング (SPA + API)** |

---

## 2. ディレクトリ構成

```
arukanabrade/
├── api/                            # Vercel Serverless Functions ★新規
│   ├── auth/
│   │   ├── register.ts             # POST /api/auth/register
│   │   ├── login.ts                # POST /api/auth/login
│   │   ├── logout.ts               # POST /api/auth/logout
│   │   └── me.ts                   # GET /api/auth/me
│   └── player/
│       └── save.ts                 # POST /api/player/save
├── lib/                            # APIユーティリティ ★新規
│   ├── prisma.ts                   # Prismaクライアントシングルトン
│   └── auth.ts                     # JWT生成・検証・Cookie操作
├── prisma/                         # Prisma ORM ★新規
│   └── schema.prisma               # DBスキーマ定義
├── docs/                           # 設計・仕様ドキュメント
├── public/                         # 静的アセット
│   └── favicon.png                 # アプリアイコン
├── src/
│   ├── App.tsx                     # ルーター定義・ナビゲーション制御
│   ├── main.tsx                    # エントリポイント
│   ├── index.css                   # グローバルスタイル (Tailwind + カスタムCSS変数)
│   │
│   ├── types/
│   │   └── index.ts                # 全型定義 (唯一の型ファイル)
│   │
│   ├── data/                       # マスタデータ (静的TS定義)
│   │   ├── units.ts                # UnitMaster × 16体
│   │   ├── enemies.ts              # EnemyMaster × 19体 (イベント用追加)
│   │   ├── quests.ts               # QuestWorld/Area/Stage
│   │   ├── skills.ts               # SkillMaster × 18種
│   │   ├── items.ts                # ItemMaster × 23種
│   │   ├── summons.ts              # SummonPool × 3種
│   │   ├── friends.ts              # FriendCandidate × 8人
│   │   ├── equipments.ts           # EquipmentMaster × 17種 ★新規
│   │   ├── missions.ts             # MissionMaster (デイリー7件・週次2件) ★新規
│   │   └── events.ts               # EventQuest × 2 / RaidBoss × 2 ★新規
│   │
│   ├── stores/                     # Zustand状態管理
│   │   ├── authStore.ts            # 認証状態管理 (user/player/isChecked) ★新規
│   │   ├── playerStore.ts          # プレイヤーデータ・通貨・スタミナ・アイテム
│   │   ├── unitStore.ts            # 所持ユニット
│   │   ├── partyStore.ts           # パーティ編成
│   │   ├── questStore.ts           # クエスト進行・フレンド選択の中継
│   │   ├── equipmentStore.ts       # 装備所持・装備中管理 ★新規
│   │   ├── missionStore.ts         # デイリーミッション進捗・報酬 ★新規
│   │   ├── raidStore.ts            # レイドボスHP・ダメージ記録 ★新規
│   │   ├── guildStore.ts           # ギルドデータ・チャット ★新規
│   │   └── arenaStore.ts           # アリーナ対戦記録・ランク ★新規
│   │
│   ├── features/                   # 画面単位のコンポーネント
│   │   ├── auth/                   # 認証画面 ★新規
│   │   │   ├── LoginPage.tsx       # ログイン画面
│   │   │   └── RegisterPage.tsx    # 新規登録画面
│   │   ├── home/HomePage.tsx       # バナー・バッジ・ミッション通知対応
│   │   ├── units/
│   │   │   ├── UnitsPage.tsx
│   │   │   └── UnitDetailPage.tsx
│   │   ├── party/PartyPage.tsx
│   │   ├── quests/QuestsPage.tsx   # ストーリー + イベントタブ
│   │   ├── friends/FriendSelectPage.tsx
│   │   ├── battle/
│   │   │   ├── BattlePage.tsx      # ラウンド制・オートバトル・装備適用・ミッション追跡
│   │   │   └── useBattleSetup.ts   # ※現在未使用 (BattlePage内に統合済み)
│   │   ├── enhance/EnhancePage.tsx # ミッション追跡対応
│   │   ├── summon/SummonPage.tsx   # ミッション追跡対応
│   │   ├── items/ItemsPage.tsx     # アイテム所持・スタミナ使用 ★新規
│   │   ├── equipment/EquipmentPage.tsx  # 装備管理・ユニット装備 ★新規
│   │   ├── missions/MissionsPage.tsx    # デイリーミッション・報酬受取 ★新規
│   │   ├── raid/RaidPage.tsx       # レイドボス挑戦 ★新規
│   │   ├── guild/GuildPage.tsx     # ギルド参加・チャット・ミッション ★新規
│   │   └── pvp/PvPPage.tsx         # アリーナ対戦 ★新規
│   │
│   ├── components/                 # 共通コンポーネント
│   │   ├── ui/
│   │   │   ├── ElementBadge.tsx
│   │   │   ├── RarityBadge.tsx
│   │   │   ├── HpBar.tsx
│   │   │   ├── BBGauge.tsx
│   │   │   ├── UnitCard.tsx
│   │   │   └── StaminaModal.tsx    # スタミナ回復モーダル ★新規
│   │   └── layout/
│   │       ├── BottomNav.tsx       # メインナビ5項目 + メニュードロワー ★更新
│   │       └── TopBar.tsx
│   │
│   └── utils/
│       ├── battleEngine.ts         # バトル計算エンジン (リーダースキル適用追加)
│       ├── elementUtils.ts         # 属性グラデーション・色ユーティリティ
│       └── format.ts               # 数値フォーマット・戦力計算
│
├── index.html                      # SPAエントリHTML (favicon.png)
├── vite.config.ts                  # Vite設定 (React + Tailwind + VitePWA + APIプロキシ)
├── vercel.json                     # Vercel設定 (ビルド・SPAリライト) ★新規
├── tsconfig.json                   # プロジェクト参照 (app/node/api)
├── tsconfig.api.json               # API用TypeScript設定 ★新規
├── .env.local.example              # 環境変数テンプレート ★新規
└── package.json
```

---

## 3. 認証システム (MVP 6.0 新規)

### 認証フロー

```
アプリ起動
  └─ checkAuth() → GET /api/auth/me (Cookie送信)
       ├─ 200 OK → user + player データ取得 → authStore にセット
       │     ├─ tutorialCompleted = true → completeTutorial() → ホーム画面
       │     └─ tutorialCompleted = false → チュートリアル画面
       └─ 401 → タイトル画面 (/title)
                 ├─ ログイン → /login → POST /api/auth/login → JWT Cookie発行
                 └─ 新規登録 → /register → POST /api/auth/register → JWT Cookie発行
```

### JWT仕様

| 項目 | 値 |
|------|-----|
| アルゴリズム | HS256 |
| 有効期限 | 30日 |
| ペイロード | `{ userId, email, iat, exp }` |
| 秘密鍵 | 環境変数 `JWT_SECRET` (32文字以上) |

### Cookie仕様

| 項目 | 値 |
|------|-----|
| 名前 | `arcana_session` |
| HttpOnly | true (JS不可) |
| Secure | true (本番のみ) |
| SameSite | lax |
| MaxAge | 2592000 (30日) |
| Path | / |

### APIエンドポイント

| メソッド | パス | 説明 | 認証 |
|---------|------|------|------|
| POST | /api/auth/register | 新規登録 | 不要 |
| POST | /api/auth/login | ログイン | 不要 |
| POST | /api/auth/logout | ログアウト | Cookie |
| GET | /api/auth/me | 認証状態確認 | Cookie |
| POST | /api/player/save | プレイヤーデータ保存 | Cookie |

### DBテーブル

| テーブル | 説明 | 主な列 |
|---------|------|--------|
| users | ユーザーアカウント | id, email, passwordHash, emailVerified |
| players | プレイヤーデータ | playerId, userId, playerName, tutorialCompleted |
| owned_units | 所持ユニット (将来用) | playerId, masterId, level, awakeningCount |
| player_items | 所持アイテム (将来用) | playerId, itemId, quantity |
| summon_history | ガチャ履歴 (将来用) | playerId, masterId, rarity, resultType |

### 環境変数

| 変数名 | 説明 | 設定箇所 |
|--------|------|---------|
| `DATABASE_URL` | Neon 接続プーラURL | .env.local / Vercel |
| `DIRECT_URL` | Neon 直接接続URL (migrate用) | .env.local / Vercel |
| `JWT_SECRET` | JWT署名シークレット (32文字以上) | .env.local / Vercel |

---

## 4. ルーティング

`src/App.tsx` で定義。React Router v7 使用。

| パス | コンポーネント | BottomNav |
|------|---------------|-----------|
| `/` | HomePage | 表示 |
| `/units` | UnitsPage | 表示 |
| `/units/:instanceId` | UnitDetailPage | 表示 |
| `/party` | PartyPage | 表示 |
| `/quests` | QuestsPage | 表示 |
| `/friends` | FriendSelectPage | **非表示** |
| `/battle` | BattlePage | **非表示** |
| `/enhance` | EnhancePage | 表示 |
| `/summon` | SummonPage | 表示 |
| `/items` | ItemsPage | 表示 |
| `/equipment` | EquipmentPage | 表示 |
| `/missions` | MissionsPage | 表示 |
| `/raid` | RaidPage | 表示 |
| `/guild` | GuildPage | 表示 |
| `/pvp` | PvPPage | 表示 |

---

## 4. 状態管理

### ストア一覧と責務

#### playerStore (`arcana-player`)
```typescript
player: PlayerData         // 名前・ランク・EXP・ゴールド・ダイヤ・スタミナ
items: OwnedItem[]         // 所持アイテム (itemId, quantity)
lastUsedFriendId: string
// addGold / spendGold / addDiamond / spendDiamond / addExp / recoverStamina / spendStamina / addItem / useItem
```

#### unitStore (`arcana-units`)
```typescript
ownedUnits: OwnedUnit[]
// addUnit / levelUpUnit / awakenUnit / toggleLock
```

#### partyStore (`arcana-party`)
```typescript
parties: PartyComposition[]
activePartyId: string
// setSlot / setLeader / createParty / setActiveParty / getActiveParty
```

#### questStore (`arcana-quests`)
```typescript
clearedStageIds: string[]
pendingStageId: string
pendingFriendId: string
// markCleared / setPendingStage / setPendingFriend / clearPending
```

#### equipmentStore (`arcana-equipments`) ★新規
```typescript
ownedEquipments: OwnedEquipment[]
// addEquipment / equipToUnit / unequipFromUnit / levelUpEquipment / getEquippedByUnit / sellEquipment
```

#### missionStore (`arcana-missions`) ★新規
```typescript
dailyMissions: DailyMissionState   // 日付 + 進捗配列
// checkDailyReset / addDailyProgress / claimDailyReward / getCompletedCount / getClaimedCount
```
- `checkDailyReset()`: 日付変更時に進捗をリセット、ログインミッション自動完了

#### raidStore (`arcana-raids`) ★新規
```typescript
raidStates: Record<string, RaidBossState>  // bossId → HP・ダメージ・参加回数
// dealDamage / getRaidState / getRewardTier
```

#### guildStore (`arcana-guild`) ★新規
```typescript
guild: Guild | null
guildMissions: GuildMissionProgress[]
guildChatMessages: ChatMessage[]
// createGuild / leaveGuild / claimGuildMission / sendChatMessage
```

#### arenaStore (`arcana-arena`) ★新規
```typescript
arenaRecord: ArenaRecord
battleHistory: ArenaBattleRecord[]
opponents: ArenaOpponent[]
// getMatchOpponents / recordWin / recordLoss / updateSeason
```

### localStorage キー一覧

| キー | 内容 |
|------|------|
| `arcana-player` | プレイヤーデータ・アイテム |
| `arcana-units` | 所持ユニット |
| `arcana-party` | パーティ編成 |
| `arcana-quests` | クエスト進行 |
| `arcana-equipments` | 装備所持・装備中管理 |
| `arcana-missions` | デイリーミッション進捗 |
| `arcana-raids` | レイドボス状態 |
| `arcana-guild` | ギルドデータ |
| `arcana-arena` | アリーナ記録 |

### データフロー: クエスト開始

```
QuestsPage
  ↓ setPendingStage(stageId)
  ↓ navigate('/friends')
FriendSelectPage
  ↓ setPendingFriend(friendId)
  ↓ navigate('/battle')
BattlePage
  ↓ 読み取り: pendingStageId, pendingFriendId
  ↓ 装備ボーナス計算 (getEquippedByUnit → calcEquipmentStats)
  ↓ リーダースキル適用 (applyLeaderSkills)
  ↓ スタミナ消費 (spendStamina)
  ↓ バトル実行 (ラウンド制)
  ↓ 勝利: markCleared, addGold, addExp, addItem
  ↓       addDailyProgress('battle_win' / 'quest_clear' / 'friend_battle')
  ↓ clearPending()
```

---

## 5. バトルエンジン

`src/utils/battleEngine.ts` に分離された純粋関数群。

| 関数 | 役割 |
|------|------|
| `calcDamage()` | ダメージ値算出 (ATK/DEF/属性/バフ/乱数) |
| `calcHeal()` | 回復量算出 |
| `executeNormalAttack()` | 通常攻撃処理 |
| `executeSkillOnTargets()` | スキル・必殺技処理 |
| `executeEnemyTurn()` | 敵の行動処理 |
| `tickBuffs()` | バフ/デバフのターン数減算 |
| `applyLeaderSkills()` | リーダースキル効果をユニット配列に適用 ★新規 |

**設計原則:** 全関数が純粋関数 (副作用なし)。BattlePage が呼び出してローカルstateを更新。

---

## 6. マスタデータ構成

全型定義は `src/types/index.ts` に集約。

| ファイル | エクスポート | アクセス用関数 |
|---------|-------------|----------------|
| units.ts | UNIT_MASTER | getUnitMaster, calcUnitStats |
| enemies.ts | ENEMY_MASTER | getEnemyMaster |
| quests.ts | QUEST_WORLDS | getAllStages, getStage |
| skills.ts | SKILL_MASTER | getSkill |
| items.ts | ITEM_MASTER | getItemMaster |
| summons.ts | SUMMON_POOLS | — |
| friends.ts | FRIEND_CANDIDATES | — |
| equipments.ts | EQUIPMENT_MASTER | getEquipmentMaster, calcEquipmentStats |
| missions.ts | DAILY_MISSIONS, WEEKLY_MISSIONS | — |
| events.ts | EVENT_QUESTS, RAID_BOSSES | getActiveEvents, getActiveRaids |

---

## 7. PWA対応

- `vite-plugin-pwa` 設定済み ✅
- `workbox.maximumFileSizeToCacheInBytes: 5MB` (ファビコン対応)
- 対象: js/css/html/ico/svg/woff2
- Service Worker: `dist/sw.js` (autoUpdate モード)

---

## 8. コード上の既知の問題

| 問題 | 場所 | 優先度 |
|------|------|--------|
| `useBattleSetup.ts` が未使用 (BattlePage内に統合済み) | src/features/battle/ | 低 |
| `App.css` が残存 (テンプレートの残骸) | src/ | 低 |
| 状態異常 (毒・麻痺) の効果処理なし | battleEngine.ts | 中 |
| レイドバトル統合未完了 (BattlePage が useLocation().state を未読み取り) | BattlePage.tsx, RaidPage.tsx | 中 |

---

## 9. ビルド・デプロイ

```bash
npm run dev      # Vite 開発サーバー起動 (http://localhost:5173)
npm run build    # TypeScript チェック + Vite ビルド → dist/
npm run preview  # ビルド結果のプレビュー
```

### 推奨デプロイ先

- **Vercel** or **Netlify**: 静的SPAのデプロイに最適
- **Railway** or **Render**: バックエンドAPIを追加する場合

---

*このドキュメントはコード変更時に同期して更新すること。*
