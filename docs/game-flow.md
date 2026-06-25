# アルカナブレイド ゲームフロー設計書

## 全体フロー概要

```
[タイトル] → [ログイン/新規登録] → [チュートリアル] → [ホーム] → [本編]
```

---

## 1. タイトル画面 `/title`

### 状態遷移
```
起動
 ↓ 1.2秒後
タップ待ち画面（"TAP TO START" 表示）
 ↓ タップ
メニューボタン表示（ログイン / 新規登録 / お知らせ）
```

### 要素
- 背景: 魔法陣アニメーション + 星エフェクト
- ロゴ: "アルカナブレイド" ゴールドグラデーション
- タップ促進: "─ TAP TO START ─" アニメーション
- ボタン: ログイン（紫）/ 新規登録（透明）/ お知らせ（グレー）
- フッター: 利用規約 / プライバシーポリシー / Ver 2.0.0
- お知らせ: モーダル表示
- 認証済みユーザー: 自動的にホームまたはチュートリアルへリダイレクト

---

## 2. 認証フロー

### ログイン `/login`
- メールアドレス + パスワード
- ログイン成功 → チュートリアル完了状態で分岐
  - 完了済み: `/` (ホーム)
  - 未完了: `/tutorial/intro`

### 新規登録 `/register`
- メールアドレス / パスワード / 利用規約同意チェック
- 登録成功 → `/tutorial/intro`

### パスワードリセット（画面のみ）
- 未実装 → 今後追加予定

---

## 3. チュートリアルフロー

全画面 `AuthGuard` 必須（ログイン済み限定）

```
/tutorial/intro
  ↓ 4シーン閲覧後
/tutorial/name
  ↓ 名前入力
/tutorial/hero
  ↓ 性別→種族→主人公確定
/tutorial/battle
  ↓ 3ステップ戦闘チュートリアル
/tutorial/complete
  ↓ 報酬受取 + 主人公ユニット獲得
/tutorial/gacha        ← ★ 初回無料10連召喚
  ↓ 召喚アニメーション + 結果確認
/ (ホーム)
```

### 各画面詳細

#### `/tutorial/intro` - 世界観紹介
- 4シーン: アルカナの力 / 召喚者の目覚め / 最初の仲間 / 最初の試練
- Skip ボタンあり
- 完了後: `/tutorial/name`

#### `/tutorial/name` - プレイヤー名入力
- 最大 12 文字
- 禁止文字: `<>"'&\/`
- 完了後: `/tutorial/hero`

#### `/tutorial/hero` - 主人公選択
- Step 1: 性別選択（男性/女性）
- Step 2: 種族選択（7種族）
- プレビューカード表示後確定
- 完了後: `/tutorial/battle`

#### `/tutorial/battle` - 戦闘チュートリアル
- 敵: シャドウスライム (風) + シャドウゴブリン (闇)
- Step 0: 通常攻撃を学ぶ
- Step 1: スキルを学ぶ
- Step 2: ブレイブバースト発動
- 完了後: `/tutorial/complete`

#### `/tutorial/complete` - チュートリアル完了演出
- 初回報酬付与（ゴールド5000 / ダイヤ500 / チケット3枚 / 強化素材）
- 主人公ユニットカード開示
- `setupFromTutorial()` でプレイヤーデータ初期化
- `addUnit()` で主人公ユニットを所持リストへ
- 完了後: `/tutorial/gacha`

#### `/tutorial/gacha` - 初回無料10連召喚 ★
- 完全無料・1回限り
- 排出: ★1（NORMAL）/ ★2（RARE）/ ★3（ARCANA）のみ
- 10連目: ★2以上確定
- 演出: 魔法陣 + パーティクル + 白フラッシュ + カード1枚ずつ開封
- 完了後: `completeTutorial()` → `/` (ホーム)

---

## 4. ホーム画面 `/`

`AuthGuard` + `MainGuard`（チュートリアル完了必須）

### 表示要素
- プレイヤー情報パネル（名前/ランク/ゴールド/ダイヤ/スタミナ）
- クイックアクション: クエスト/ユニット/召喚/強化/装備/編成
- サブメニュー: アリーナ/ギルド/ミッション/レイドボス
- イベントバナー
- ミッション達成バッジ

---

## 5. クエストフロー（実装済み）

```
/quests → クエスト一覧（世界選択）
  ↓ エリア選択
  ↓ ステージ選択
/friends → フレンド選択
  ↓
/battle → バトル
  ↓ 勝利
/scenario/:stageId → クリア後ストーリー
  ↓
/ (ホーム)
```

---

## 6. ガチャフロー `/summon`（チュートリアル後）

- プールタブ: ノーマル / レギュラー / プレミアム
- 1連 / 10連 / チケット使用
- 排出: ★1〜★3（全プール共通）
- 被り: 覚醒 +1 / 最大覚醒済みは覚醒結晶に変換
- 演出: カード1枚ずつ開封 or 全結果グリッド表示切替

---

## 7. フェーズ管理 (tutorialStore)

| Phase | 画面 |
|-------|------|
| `title` | タイトル画面 |
| `intro` | 世界観紹介 |
| `name_input` | 名前入力 |
| `hero_select` | 主人公選択 |
| `tutorial_battle` | 戦闘チュートリアル |
| `initial_gacha` | 初回無料召喚 |
| `complete` | 完了（ホームへ） |

---

## 8. ルート定義 (App.tsx)

| パス | コンポーネント | ガード |
|------|--------------|--------|
| `/title` | TitleScreen | なし |
| `/login` | LoginPage | なし |
| `/register` | RegisterPage | なし |
| `/tutorial/intro` | TutorialIntroScreen | Auth |
| `/tutorial/name` | PlayerNameInputScreen | Auth |
| `/tutorial/hero` | HeroSelectScreen | Auth |
| `/tutorial/battle` | TutorialBattleScreen | Auth |
| `/tutorial/complete` | TutorialCompleteScreen | Auth |
| `/tutorial/gacha` | TutorialGachaScreen | Auth |
| `/` | HomePage | Auth + Main |
| `/units` | UnitsPage | Auth + Main |
| `/summon` | SummonPage | Auth + Main |
| `/quests` | QuestsPage | Auth + Main |
| `/battle` | BattlePage | Auth + Main |
| `/scenario/:stageId` | ScenarioScreen | Auth + Main |
| (その他) | — | Auth + Main |

---

*最終更新: 2026-06-25*
