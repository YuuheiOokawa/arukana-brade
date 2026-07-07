// プレゼントボックス: 運営配布ギフトのカタログ
// 新しいギフトを配布するときはここに追加する（idは一意・変更しないこと）
export interface GiftMaster {
  id: string;
  title: string;
  description: string;
  emoji: string;
  rewards: {
    gold?: number;
    diamond?: number;
    stamina?: number;
    items?: { itemId: string; quantity: number }[];
  };
  // 期限（epoch ms）。省略時は無期限
  expiresAt?: number;
}

export const GIFT_CATALOG: GiftMaster[] = [
  {
    id: 'gift_welcome',
    title: 'はじめての冒険応援ギフト',
    description: 'アルカナブレイドの世界へようこそ！冒険のお供にどうぞ。',
    emoji: '🎉',
    rewards: { diamond: 300, gold: 30000 },
  },
  {
    id: 'gift_release_summon',
    title: 'リリース記念 召喚チケット',
    description: 'リリースを記念して召喚チケットをプレゼント！',
    emoji: '🎫',
    rewards: { items: [{ itemId: 'item_summon_ticket', quantity: 5 }] },
  },
  {
    id: 'gift_skill_book_debut',
    title: '新機能「スキル書き換え」記念',
    description: 'スキルの書で必殺技を自由にカスタマイズしよう！',
    emoji: '📜',
    rewards: { items: [{ itemId: 'item_skill_book', quantity: 3 }], gold: 10000 },
  },
  {
    id: 'gift_stamina_support',
    title: '冒険サポートセット',
    description: 'スタミナポーションで冒険を続けよう！',
    emoji: '⚡',
    rewards: { items: [{ itemId: 'item_stamina_potion', quantity: 3 }], stamina: 30 },
  },
  {
    id: 'gift_evolve_material',
    title: '装備進化 応援素材セット',
    description: '新機能「装備進化」に使える素材の詰め合わせ。',
    emoji: '✨',
    rewards: {
      items: [
        { itemId: 'item_stone_core', quantity: 10 },
        { itemId: 'item_magic_crystal', quantity: 5 },
      ],
    },
  },
];

export const getGift = (id: string): GiftMaster | undefined =>
  GIFT_CATALOG.find(g => g.id === id);
