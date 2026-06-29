# アルカナブレイド API 一覧表

## 概要

全APIはVercel Serverless Functionsとして実装されており、`/api/` 配下に配置されています。
認証はJWT（HTTP Only Cookie `arcana_session`）を使用します。

---

## 認証 API (`/api/auth/`)

### POST /api/auth/register — 新規ユーザー登録

| 項目 | 内容 |
|------|------|
| HTTPメソッド | POST |
| エンドポイント | /api/auth/register |
| ソースファイル | api/auth/register.ts |
| 認証必要 | 不要 |

**リクエストボディ:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**バリデーション:**
- email: 正規表現による形式チェック
- password: 最低8文字

**処理フロー:**
1. メール形式・パスワード長バリデーション
2. 同じメールアドレスの既存ユーザー確認
3. bcrypt でパスワードハッシュ化（コスト係数: 12）
4. `User` レコード作成
5. `Player` レコード同時作成（playerName='勇者'）
6. JWT トークン生成（有効期限: 30日）
7. `arcana_session` Cookie に Set-Cookie
8. 作成した user・player データを返却

**レスポンス（200）:**
```json
{
  "user": { "id": "clxxx", "email": "user@example.com" },
  "player": { "playerId": "clyyy", "playerName": "勇者", ... }
}
```

**エラーレスポンス:**
| コード | メッセージ |
|--------|-----------|
| 400 | Invalid email / Password must be at least 8 characters |
| 409 | Email already in use |
| 405 | Method not allowed |
| 500 | Internal server error |

**呼び出し元:** `src/features/auth/RegisterPage.tsx`

---

### POST /api/auth/login — ログイン

| 項目 | 内容 |
|------|------|
| HTTPメソッド | POST |
| エンドポイント | /api/auth/login |
| ソースファイル | api/auth/login.ts |
| 認証必要 | 不要 |

**リクエストボディ:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**処理フロー:**
1. User レコードを email で検索
2. bcrypt.compare でパスワード照合
3. ログイン日数の更新（前回ログインから日付が変わった場合 +1）
4. lastLoginAt を更新
5. JWT 生成・Cookie 設定
6. user・player データを返却

**レスポンス（200）:**
```json
{
  "user": { "id": "...", "email": "..." },
  "player": { "playerId": "...", "playerName": "...", ... }
}
```

**エラーレスポンス:**
| コード | メッセージ |
|--------|-----------|
| 400 | Email and password required |
| 401 | Invalid credentials |
| 405 | Method not allowed |
| 500 | Internal server error |

**呼び出し元:** `src/features/login/LoginPage.tsx`

---

### GET /api/auth/me — 認証確認・ゲームデータ取得

| 項目 | 内容 |
|------|------|
| HTTPメソッド | GET |
| エンドポイント | /api/auth/me |
| ソースファイル | api/auth/me.ts |
| 認証必要 | **必要** |

**処理フロー:**
1. Cookie から `arcana_session` JWT を取得・検証
2. JWT の `userId` で Player を取得
3. `gameStateJson` を含む全データを返却

**レスポンス（200）:**
```json
{
  "user": { "id": "...", "email": "..." },
  "player": {
    "playerId": "...",
    "playerName": "...",
    "gold": 1000,
    "diamond": 50,
    "gameStateJson": { ... }
  }
}
```

**エラーレスポンス:**
| コード | メッセージ |
|--------|-----------|
| 401 | Unauthorized (JWT無効/期限切れ) |
| 404 | Player not found |
| 405 | Method not allowed |
| 500 | Internal server error |

**呼び出し元:** `src/stores/authStore.ts` の `checkAuth()` (App.tsx 起動時)

---

### POST /api/auth/logout — ログアウト

| 項目 | 内容 |
|------|------|
| HTTPメソッド | POST |
| エンドポイント | /api/auth/logout |
| ソースファイル | api/auth/logout.ts |
| 認証必要 | 不要（Cookieをクリアするだけ） |

**処理フロー:**
1. `arcana_session` Cookie を無効化（expires=past）

**レスポンス（200）:**
```json
{ "ok": true }
```

**呼び出し元:** `src/stores/authStore.ts` の `logout()`

---

## プレイヤー API (`/api/player/`)

### POST /api/player/save — プレイヤー情報保存

| 項目 | 内容 |
|------|------|
| HTTPメソッド | POST |
| エンドポイント | /api/player/save |
| ソースファイル | api/player/save.ts |
| 認証必要 | **必要** |
| 使用DBテーブル | Player |

**リクエストボディ:**
```json
{
  "playerName": "アルカナ太郎",
  "tutorialCompleted": true,
  "title": "勇者の証",
  "bio": "よろしくお願いします",
  "favoriteUnitId": "unit_001"
}
```

**バリデーション:**
- playerName: 最大12文字
- bio: 最大100文字

**処理:** Player.update() で指定フィールドのみ更新

**レスポンス（200）:**
```json
{ "ok": true }
```

**エラーレスポンス:** 401, 400, 405, 500

**呼び出し元:**
- `src/features/tutorial/TutorialCompleteScreen.tsx`
- `src/features/profile/ProfilePage.tsx`
- `src/stores/authStore.ts` の `syncPlayerName()`, `syncTutorialComplete()`

---

### POST /api/player/currency — 通貨・経験値・スタミナ保存

| 項目 | 内容 |
|------|------|
| HTTPメソッド | POST |
| エンドポイント | /api/player/currency |
| ソースファイル | api/player/currency.ts |
| 認証必要 | **必要** |
| 使用DBテーブル | Player |

**リクエストボディ（全項目オプション）:**
```json
{
  "gold": 5000,
  "diamond": 100,
  "exp": 2500,
  "playerRank": 5,
  "stamina": 30,
  "maxStamina": 55
}
```

**バリデーション:** 各値 ≥ 0

**処理:** Player.update() で数値系カラムを更新

**レスポンス（200）:**
```json
{ "ok": true }
```

**呼び出し元:**
- `src/features/tutorial/TutorialCompleteScreen.tsx`（チュートリアル完了後の報酬付与）
- `src/features/battle/BattlePage.tsx`（バトル勝利後）

---

### POST /api/player/saveAll — 全ゲーム状態の一括保存

| 項目 | 内容 |
|------|------|
| HTTPメソッド | POST |
| エンドポイント | /api/player/saveAll |
| ソースファイル | api/player/saveAll.ts |
| 認証必要 | **必要** |
| 使用DBテーブル | Player |

**リクエストボディ:**
```json
{
  "state": {
    "player": { "name": "...", "gold": 5000, ... },
    "units": { "ownedUnits": [...] },
    "quests": { "clearedStageIds": [...] },
    ...
  }
}
```

**処理（トランザクション）:**
1. `gameStateJson` に state 全体を保存
2. 正規化カラムを state から同期:
   - playerName, playerRank, exp, gold, diamond
   - stamina, maxStamina, title

**レスポンス（200）:**
```json
{ "ok": true }
```

**呼び出し元:** `src/lib/syncService.ts` の `saveToServer()`（自動保存・即時保存）

---

## 召喚 API (`/api/summon/`)

### POST /api/summon/save — ガチャ結果保存

| 項目 | 内容 |
|------|------|
| HTTPメソッド | POST |
| エンドポイント | /api/summon/save |
| ソースファイル | api/summon/save.ts |
| 認証必要 | **必要** |
| 使用DBテーブル | OwnedUnit, SummonHistory, Player |

**リクエストボディ:**
```json
{
  "poolId": "standard",
  "units": [
    { "masterId": "unit_ssr_001", "rarity": "SSR", "resultType": "new" },
    { "masterId": "unit_sr_002", "rarity": "SR", "resultType": "crystal" }
  ],
  "diamondSpent": 150,
  "ticketUsed": false
}
```

**resultType の種別:**
| 値 | 意味 |
|----|------|
| `new` | 新規ユニット（OwnedUnitに追加） |
| `crystal` | 被り（覚醒結晶付与、OwnedUnit未追加） |
| `awakening` | 既存ユニットの覚醒 |

**処理（Prismaトランザクション）:**
1. `resultType === 'new'` のユニットを `OwnedUnit.createMany()`
2. 全件を `SummonHistory.createMany()` に記録
3. `Player.update()` でダイヤを減算

**レスポンス（200）:**
```json
{ "ok": true }
```

**呼び出し元:**
- `src/features/summon/SummonPage.tsx`
- `src/features/tutorial/TutorialGachaScreen.tsx`

---

## ユニット API (`/api/units/`)

### POST /api/units/sync — ユニット全件同期

| 項目 | 内容 |
|------|------|
| HTTPメソッド | POST |
| エンドポイント | /api/units/sync |
| ソースファイル | api/units/sync.ts |
| 認証必要 | **必要** |
| 使用DBテーブル | OwnedUnit |

**リクエストボディ:**
```json
{
  "units": [
    {
      "masterId": "unit_ssr_001",
      "level": 20,
      "exp": 1500,
      "awakenRank": 2,
      "awakeningCount": 1,
      "currentRarity": "★3",
      "isLocked": false
    }
  ]
}
```

**処理（Prismaトランザクション）:**
1. `OwnedUnit.deleteMany()` でプレイヤーの全ユニット削除
2. `OwnedUnit.createMany()` で全件再作成

**レスポンス（200）:**
```json
{ "ok": true }
```

**呼び出し元:**
- `src/features/tutorial/TutorialGachaScreen.tsx`（チュートリアル完了後）
- 将来: 強化・覚醒後の同期

---

## API 利用フロー サマリー

```
App起動
  └─ GET /api/auth/me
       └─ 認証確認 + gameStateJson 取得 → 全ストアに復元

ゲームプレイ中
  └─ [各ストア更新] → 1.5秒デバウンス → POST /api/player/saveAll

ガチャ実行
  └─ POST /api/summon/save → OwnedUnit + SummonHistory + Diamond同期

チュートリアル完了
  └─ POST /api/units/sync
  └─ POST /api/player/save (tutorialCompleted=true)
  └─ POST /api/player/currency (初期報酬付与)

ログアウト
  └─ POST /api/player/saveAll (即時保存)
  └─ POST /api/auth/logout
```

---

## 認証ヘルパー (`lib/auth.ts`)

| 関数名 | 役割 |
|--------|------|
| `generateToken(userId)` | JWT生成（有効期限: 30日） |
| `verifyToken(token)` | JWT検証・デコード |
| `setAuthCookie(res, token)` | Set-Cookie ヘッダー設定 |
| `clearAuthCookie(res)` | Cookie クリア |
| `getTokenFromRequest(req)` | Cookie から JWT 取得 |

**JWT設定:**
- Secret: `process.env.JWT_SECRET`
- Cookie名: `arcana_session`
- httpOnly: true（XSS対策）
- secure: 本番環境のみ true（HTTPS強制）
- sameSite: 'lax'（CSRF軽減）
- maxAge: 2,592,000秒（30日）
