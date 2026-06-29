# アルカナブレイド 学習ロードマップ

## このロードマップについて

アルカナブレイドのソースコードを完全に理解するための学習順序です。
基礎から積み上げることで、プロが書いたコードがなぜそうなっているかを理解できます。

---

## STAGE 1: Web開発の土台

### Step 1: HTML / CSS
**学習理由:** すべてのWebアプリの土台。Reactに進む前に必須。

**このプロジェクトで見るべきファイル:**
- `src/index.css` — グローバルスタイル
- `src/App.css` — アプリ基本スタイル
- `tailwind.config.ts` — Tailwindの設定

**練習課題:**
- ゲームのカード（ユニットカード）をHTMLとCSSだけで作ってみる
- モバイル向けに縦長レイアウトを作ってみる

---

### Step 2: JavaScript（ES2022+）
**学習理由:** TypeScript・Reactのすべての基礎。非同期・配列処理を特に重視。

**このプロジェクトで見るべきファイル:**
- `src/utils/format.ts` — 純粋なユーティリティ関数の例
- `src/utils/battleEngine.ts` — ゲームロジックの実装
- `src/data/units.ts` — 配列・オブジェクトの使い方

**重要な書き方:**
```javascript
// 配列メソッド
const ownedSSR = units.filter(u => u.currentRarity === 'SSR');
const unitNames = units.map(u => u.masterId);

// 非同期処理
const response = await fetch('/api/auth/me');
const data = await response.json();

// スプレッド演算子
const updatedPlayer = { ...player, gold: player.gold + 1000 };
```

**練習課題:**
- バトルのダメージ計算をJavaScriptで実装してみる
- ユニット配列をレアリティ順にソートしてみる

---

## STAGE 2: TypeScript

### Step 3: TypeScript
**学習理由:** アルカナブレイド全体がTypeScriptで書かれている。型の概念は必須。

**このプロジェクトで見るべきファイル:**
- `src/types/index.ts` — 全型定義の宝庫
- `api/auth/register.ts` — 型安全なAPI

**重要な書き方:**
```typescript
// インターフェース定義
interface OwnedUnit {
  id: string;
  masterId: string;
  level: number;
  currentRarity: string;
}

// Union型
type TutorialPhase = 'title' | 'intro' | 'name_input' | 'complete';

// ジェネリクス
async function fetchApi<T>(url: string): Promise<T> {
  const res = await fetch(url);
  return res.json() as T;
}

// オプショナルチェーン
const name = player?.playerName ?? '勇者';
```

**練習課題:**
- UnitMaster 型を見て、同じ構造のオブジェクトを型付きで作ってみる
- API のレスポンスに型をつけてみる

---

## STAGE 3: React

### Step 4: React 基礎
**学習理由:** フロントエンド全体がReactで構築されている。

**このプロジェクトで見るべきファイル:**
- `src/main.tsx` — Reactのエントリーポイント
- `src/components/layout/BottomNav.tsx` — 基本的なコンポーネント
- `src/components/layout/TopBar.tsx` — props/状態の読み取り例

**重要な書き方:**
```tsx
// 関数コンポーネント
const UnitCard: React.FC<{ unit: OwnedUnit }> = ({ unit }) => {
  return (
    <div className="card">
      <h2>{unit.masterId}</h2>
      <p>Lv.{unit.level}</p>
    </div>
  );
};

// useState
const [count, setCount] = useState(0);

// useEffect
useEffect(() => {
  fetchData(); // マウント時に実行
}, []); // [] = マウント時のみ
```

**練習課題:**
- ユニットカードコンポーネントを自分で作ってみる
- BottomNav を参考にナビゲーションを実装してみる

---

### Step 5: React Router
**学習理由:** ページ遷移の管理に使用されている。SPAのルーティング理解に必須。

**このプロジェクトで見るべきファイル:**
- `src/App.tsx` — ルーティング設定全体

**重要な書き方:**
```tsx
// ルート定義
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/units/:instanceId" element={<UnitDetailPage />} />
</Routes>

// ナビゲーション
const navigate = useNavigate();
navigate('/battle');

// パラメータ取得
const { instanceId } = useParams();
```

**練習課題:**
- App.tsx のルーティング設定を全部読んで、全画面遷移図を書いてみる

---

## STAGE 4: 状態管理

### Step 6: Zustand（状態管理）
**学習理由:** アルカナブレイドの全ゲームデータはZustandで管理されている。

**このプロジェクトで見るべきファイル:**
- `src/stores/playerStore.ts` — 最も基本的なストア
- `src/stores/unitStore.ts` — 複雑なゲームロジックを含むストア

**重要な書き方:**
```typescript
// ストア定義
const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      player: initialPlayer,
      addGold: (amount) => set(state => ({
        player: { ...state.player, gold: state.player.gold + amount }
      })),
    }),
    { name: 'arcana-player' } // localStorageのキー
  )
);

// コンポーネントで使用
const { player, addGold } = usePlayerStore();
```

**練習課題:**
- playerStore.ts を全部読んで、addExp のランクアップ処理を図解してみる
- シンプルなカウンターをZustandで実装してみる

---

## STAGE 5: バックエンド API

### Step 7: Next.js / Vite API Routes
**学習理由:** API はVercel Serverless Functionsで実装されている。

**このプロジェクトで見るべきファイル:**
- `api/auth/register.ts` — 完全なAPIの例
- `vercel.json` — APIのルーティング設定

**重要な書き方:**
```typescript
// Vercel Serverless Function の基本形
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { email, password } = req.body;
  // 処理...
  return res.status(200).json({ ok: true });
}
```

**練習課題:**
- api/auth/me.ts を読んで、認証フローを図解してみる

---

### Step 8: Prisma ORM
**学習理由:** DBアクセスはすべてPrismaで行われている。

**このプロジェクトで見るべきファイル:**
- `prisma/schema.prisma` — スキーマ定義
- `api/auth/register.ts` — create の例
- `api/summon/save.ts` — createMany + トランザクションの例

**重要な書き方:**
```typescript
// 1件取得
const player = await prisma.player.findUnique({
  where: { userId }
});

// 複数作成
await prisma.ownedUnit.createMany({
  data: newUnits.map(u => ({ playerId, masterId: u.masterId, ... }))
});

// トランザクション
await prisma.$transaction([
  prisma.ownedUnit.deleteMany({ where: { playerId } }),
  prisma.ownedUnit.createMany({ data: units }),
]);

// 更新
await prisma.player.update({
  where: { playerId },
  data: { gold: { decrement: spent } }
});
```

**練習課題:**
- schema.prisma を読んでER図を自分で書いてみる
- Prisma のマイグレーションコマンドを調べてみる（npx prisma migrate dev）

---

## STAGE 6: データベース

### Step 9: PostgreSQL 基礎
**学習理由:** バックエンドのデータは全てPostgreSQLに保存される。

**このプロジェクトで見るべきファイル:**
- `prisma/schema.prisma` — テーブル構造（SQLに変換される）
- `prisma/migrations/` — 実際に生成されたSQL

**重要なSQL:**
```sql
-- Prismaが生成するSQLの例
CREATE TABLE "Player" (
  "playerId" TEXT NOT NULL,
  "userId" TEXT NOT NULL UNIQUE,
  "playerName" TEXT NOT NULL DEFAULT '勇者',
  "gold" INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY ("playerId")
);

-- リレーション
ALTER TABLE "Player" ADD CONSTRAINT "Player_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
```

**練習課題:**
- schema.prisma の各テーブルをSQLのCREATE TABLE文に変換してみる
- ER図を見てJOINクエリを考えてみる

---

## STAGE 7: 認証・セキュリティ

### Step 10: 認証処理（JWT + bcrypt + Cookie）
**学習理由:** ゲームのデータ保護に認証は必須。

**このプロジェクトで見るべきファイル:**
- `lib/auth.ts` — JWT/Cookie の実装
- `api/auth/register.ts` — 登録時のハッシュ化
- `api/auth/login.ts` — ログイン時の検証

**重要な概念:**
```
パスワード保存の安全な方法:
平文 → bcrypt.hash(password, 12) → "$2b$12$..."（DB保存）
ログイン時 → bcrypt.compare(input, hash) → true/false

JWT の仕組み:
{ userId } → jwt.sign() → "eyJhbG..." （Cookie送信）
リクエスト時 → jwt.verify() → { userId } （認証確認）
```

**練習課題:**
- 認証フローを「ユーザー → フロントエンド → API → DB」の図で書いてみる
- JWTをjwt.ioで分解してみる（署名の仕組みを理解）

---

## STAGE 8: デプロイ・インフラ

### Step 11: Vercelデプロイ
**学習理由:** このプロジェクトはVercelにデプロイされる想定。

**このプロジェクトで見るべきファイル:**
- `vercel.json` — ルーティング設定
- `.env`（環境変数）— DATABASE_URL, JWT_SECRET

**vercel.json の理解:**
```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**練習課題:**
- Vercelに無料アカウントを作ってHello Worldをデプロイしてみる

---

## STAGE 9: 設計・改善

### Step 12: 設計書・ER図作成
**学習理由:** コードを読むだけでなく、設計を文書化できる能力が重要。

**練習課題:**
- このドキュメントを参考に、自分でER図を手書きしてみる
- API一覧を自分でまとめてみる
- 改善点を3つ考えてGitHub Issuesに書いてみる

---

## 学習の優先度チャート

```
🔴 必須（最初に）
  └─ JavaScript / TypeScript
  └─ React 基礎
  └─ Zustand（状態管理）

🟡 重要（次に）
  └─ Prisma ORM
  └─ API Routes（Serverless）
  └─ JWT 認証

🟢 発展（余裕があれば）
  └─ PostgreSQL SQL
  └─ Vercel デプロイ
  └─ PWA / Service Worker
```

---

## このプロジェクトで学べる主要な設計パターン

| パターン名 | 使用箇所 | 学習価値 |
|-----------|---------|---------|
| シングルトン | `lib/prisma.ts` | DB接続の効率化 |
| Observer（Subscribe） | `syncService.ts` | 状態変化の検知 |
| デバウンス | `scheduleSave()` | パフォーマンス最適化 |
| ガードコンポーネント | `AuthGuard`, `MainGuard` | ルートアクセス制御 |
| ハイブリッド永続化 | localStorage + PostgreSQL | データの耐障害性 |
| トランザクション | ガチャ保存・ユニット同期 | データ整合性の保証 |
| マスターデータ分離 | `src/data/*.ts` | データとロジックの分離 |
