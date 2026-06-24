# アルカナブレイド ⚔️

**～剣と召喚の覇者～**

ブラウザで動作するスマホ向けターン制RPGゲームです。

---

## 起動方法

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev
```

ブラウザで `http://localhost:5173` を開いてください。

---

## 技術構成

| 技術 | バージョン | 用途 |
|------|------------|------|
| React | 19 | UIフレームワーク |
| TypeScript | 6 | 型安全 |
| Vite | 8 | ビルドツール |
| Tailwind CSS v4 | 4 | スタイリング |
| Zustand | 5 | 状態管理 |
| React Router v7 | 7 | ルーティング |
| localStorage | - | データ保存 (Zustand persist) |

---

## ディレクトリ構成

```
src/
├── components/
│   ├── ui/           # 共通UIコンポーネント (ElementBadge, RarityBadge, HpBar, BBGauge, UnitCard)
│   └── layout/       # レイアウト (BottomNav, TopBar)
├── data/             # マスタデータ
│   ├── units.ts      # ユニットマスタ (16体)
│   ├── enemies.ts    # 敵マスタ (12体)
│   ├── quests.ts     # クエストマスタ (2ワールド/4エリア/9ステージ)
│   ├── skills.ts     # スキルマスタ
│   ├── items.ts      # アイテムマスタ
│   ├── summons.ts    # 召喚プールマスタ
│   └── friends.ts    # フレンド候補マスタ
├── features/         # 機能別画面
│   ├── home/         # ホーム画面
│   ├── units/        # ユニット一覧・詳細
│   ├── party/        # パーティ編成
│   ├── quests/       # クエスト・ワールドマップ
│   ├── friends/      # フレンド選択
│   ├── battle/       # バトル画面
│   ├── enhance/      # 強化・覚醒
│   └── summon/       # 召喚
├── stores/           # Zustand状態管理
│   ├── playerStore.ts
│   ├── unitStore.ts
│   ├── partyStore.ts
│   └── questStore.ts
├── types/index.ts    # 全型定義
└── utils/
    ├── battleEngine.ts # バトル計算エンジン
    ├── storage.ts      # ストレージ抽象化
    └── format.ts       # 数値フォーマット
```

---

## 実装済み機能

- [x] ホーム画面（プレイヤー情報・スタミナ・通貨表示）
- [x] ユニット一覧・詳細（フィルター・ソート機能）
- [x] パーティ編成（最大5体・リーダー設定）
- [x] クエスト（ワールドマップ→エリア→ステージ選択）
- [x] フレンド選択（クエスト開始前に表示）
- [x] ターン制バトル（自軍5体＋フレンド1体 vs 敵複数）
- [x] 通常攻撃・スキル・必殺技（BBゲージ制）
- [x] 属性相性・マルチウェーブ・報酬獲得
- [x] ユニット強化（EXPアイテム）・覚醒ランクアップ
- [x] 召喚（1回・10連、SR以上保証、演出あり）
- [x] localStorage自動保存

---

## 設計ポイント（将来拡張）

### マスタデータ → API移行
`src/data/*.ts` の import を `fetch('/api/master/*')` に差し替えるだけで移行可能。

### フレンド機能 → 本格実装
- 初回: `src/data/friends.ts` の固定データ
- 将来: `/api/friends/list` から取得。`BattleUnit.isFriend = true` の区別はそのまま使用可能。

### ストレージ → バックエンド移行
`src/utils/storage.ts` に抽象化レイヤーを設置済み。Zustand persist を外してAPI同期に差し替え。

---

## 属性相性

```
炎 ▶ 風 ▶ 土 ▶ 水 ▶ 炎（循環）
光 ◀▶ 闇（相互）
有利: 1.5倍 / 不利: 0.75倍
```

## レアリティ

| レアリティ | 最大Lv | 最大覚醒 |
|------------|--------|----------|
| SSR | 100 | 5 |
| SR | 80 | 4 |
| R | 60 | 3 |
| N | 30 | 1 |
