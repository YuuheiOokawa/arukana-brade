# バックログ
# アルカナブレイド

最終更新: 2026-06-24

---

## 現在の実装状況サマリー

```
MVP完成度: 約95%
ビルド状態: ✅ 正常 (tsc + vite build 通過)
起動確認: ✅ http://localhost:5173 で動作確認済み
```

---

## 実装済み機能

コードを確認して実動作が確認できたもの。

| 機能 | ファイル | 完成度 |
|------|---------|--------|
| ホーム画面 (バナー・バッジ対応) | features/home/HomePage.tsx | ✅ 完成 |
| ユニット一覧 | features/units/UnitsPage.tsx | ✅ 完成 |
| ユニット詳細 | features/units/UnitDetailPage.tsx | ✅ 完成 |
| パーティ編成 (5スロット) | features/party/PartyPage.tsx | ✅ 完成 |
| フレンド選択画面 | features/friends/FriendSelectPage.tsx | ✅ 完成 |
| クエスト選択 (ストーリー・イベント) | features/quests/QuestsPage.tsx | ✅ 完成 |
| イベントクエスト | features/quests/QuestsPage.tsx, data/events.ts | ✅ 完成 |
| バトル画面 (ラウンド制) | features/battle/BattlePage.tsx | ✅ 完成 |
| 通常攻撃 | battleEngine.ts | ✅ 完成 |
| スキル使用 | battleEngine.ts | ✅ 完成 |
| 必殺技 (BBゲージ制) | battleEngine.ts | ✅ 完成 |
| 属性相性 (1.5x/0.75x) | battleEngine.ts | ✅ 完成 |
| マルチウェーブ | BattlePage.tsx | ✅ 完成 |
| 勝利・敗北判定 | BattlePage.tsx | ✅ 完成 |
| 報酬獲得 (Gold/EXP/Item) | BattlePage.tsx | ✅ 完成 |
| バフ/デバフ (ターン管理) | battleEngine.ts | ✅ 完成 |
| リーダースキル適用 | battleEngine.ts, BattlePage.tsx | ✅ 完成 |
| オートバトル | BattlePage.tsx | ✅ 完成 |
| ユニット強化 (EXPアイテム) | features/enhance/EnhancePage.tsx | ✅ 完成 |
| 覚醒ランクアップ | features/enhance/EnhancePage.tsx | ✅ 完成 |
| 召喚 1回/10連 | features/summon/SummonPage.tsx | ✅ 完成 |
| 召喚演出 | SummonPage.tsx | ✅ 簡易版 |
| アイテム所持画面 | features/items/ItemsPage.tsx | ✅ 完成 |
| スタミナポーション使用UI | components/ui/StaminaModal.tsx | ✅ 完成 |
| 装備システム | features/equipment/EquipmentPage.tsx | ✅ 完成 |
| 装備ステータス適用 | BattlePage.tsx, stores/equipmentStore.ts | ✅ 完成 |
| デイリーミッション | features/missions/MissionsPage.tsx | ✅ 完成 |
| レイドボス | features/raid/RaidPage.tsx | ✅ 完成 |
| ギルド | features/guild/GuildPage.tsx | ✅ 完成 |
| アリーナ/PvP | features/pvp/PvPPage.tsx | ✅ 完成 |
| PWA設定 | vite.config.ts | ✅ 完成 |
| localStorage保存 (全ストア) | stores/*.ts | ✅ 完成 |
| スタミナ自動回復 (5分/1) | playerStore.ts | ✅ 完成 |
| プレイヤーランクアップ | playerStore.ts | ✅ 完成 |
| BottomNav メニュードロワー | components/layout/BottomNav.tsx | ✅ 完成 |

---

## 一部実装・要改善の機能

### 🟡 中優先度

#### [IMPROVE-001] 状態異常の効果処理なし
- **状況:** `status_poison` / `status_paralyze` のSkillEffectType・SkillMasterは定義済み
- **問題:** `battleEngine.ts` の `executeSkillOnTargets()` で poison/paralyze の付与処理が未実装
- **対応:** 毎ターン開始時に statusEffect を確認して効果を適用する処理を追加

#### [IMPROVE-002] バトルログが少ない
- **状況:** `logs.slice(0, 2)` で2行のみ表示。スクロールもない
- **対応:** スクロール可能なログエリアに変更、または展開ボタンで全ログ表示

#### [IMPROVE-003] レイドバトル統合
- **状況:** RaidPage → `/battle` 遷移時に `state: { isRaid: true }` を渡すが、BattlePage は `useLocation().state` を読んでいない
- **対応:** BattlePage で `useLocation().state` を確認し、レイドステージとして認識する処理を追加。勝利時に `raidStore.dealDamage()` を呼ぶ

#### [IMPROVE-004] 複数パーティのUI未実装
- **状況:** partyStore は複数パーティ保存に対応しているが、UIは1パーティのみ
- **対応:** PartyPage にパーティ切り替えタブを追加

### 🟢 低優先度

#### [CLEANUP-001] useBattleSetup.ts が未使用
- BattlePage.tsx に統合済みで使われていない
- 削除するか、BattlePage から抽出して活用するか決める

#### [CLEANUP-002] App.css / src/assets/ の残骸
- Vite テンプレートの残骸ファイル
- 削除しても問題なし

---

## 未実装機能

コードが存在しない・または型定義のみで実装がないもの。

### 将来機能 (フェーズ5候補)

| # | 機能 | 概要 | 優先度 | 工数 |
|---|------|------|--------|------|
| 1 | 倍速バトル | バトル速度 x2/x4 | 中 | 小 |
| 2 | ショップ | ゴールドでアイテム購入 | 中 | 中 |
| 3 | 実績システム | 条件達成で報酬 | 低 | 中 |
| 4 | BGM・SE | サウンド実装 | 中 | 中 |
| 5 | 限界突破 | 最大Lv超え | 高 | 中 |
| 6 | クラウドセーブ | バックエンドAPI連携 | 高 | 大 |
| 7 | フレンド機能 (API) | 他プレイヤーのリーダー使用 | 高 | 大 |
| 8 | 課金システム | ダイヤ購入 | 中 | 大 |
| 9 | プロフィール・設定 | プレイヤー名変更・データリセット | 中 | 小 |

---

## 技術課題

| ID | 課題 | 対応方針 |
|----|------|---------|
| TECH-001 | データ量増加時の localStorage 容量制限 | IndexedDB 移行を検討 (ユニット数が100体超えたら) |
| TECH-002 | マスタデータのTS直書きはデータ数が増えると管理困難 | JSON分離 → CDN配信 → DB化の順で移行 |
| TECH-003 | バトルエンジンのテストが存在しない | Vitest でユニットテストを追加 |
| TECH-004 | 型の any 使用箇所なし (良い状態) | 維持 |

---

## データ拡張ロードマップ

| データ種別 | 現在 | フェーズ2目標 | 最終目標 |
|-----------|------|------------|---------|
| ユニット | 16体 | 50体 | 300体以上 |
| 敵 | 19体 | 40体 | 200体以上 |
| スキル | 18種 | 60種 | 1000種以上 |
| クエストステージ | 9 | 50 | 500以上 |
| アイテム | 23種 | 60種 | 200種以上 |
| 装備 | 17種 | 50種 | 200種以上 |
| ミッション | 9件 | 30件 | 100件以上 |
| イベント | 2種 | 5種 | 常時1種以上 |

---

*このバックログはスプリント開始時に優先度を見直すこと。*
*バグ修正は機能追加より優先する。*
