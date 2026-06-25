import type { ScenarioMaster } from '../types';

export const SCENARIOS: ScenarioMaster[] = [
  {
    scenarioId: 'scenario_w1s1',
    questId: 'q_w1',
    stageId: 'w1-1',
    backgroundKey: 'forest',
    lines: [
      { lineId: '1', type: 'narration', text: '遥かなる古の時代——アルカナと呼ばれる神秘の力が、世界の命運を握っていた。' },
      { lineId: '2', type: 'narration', text: 'その力は選ばれし者にのみ宿り、召喚士として覚醒した者だけが扱うことができる。' },
      { lineId: '3', type: 'dialogue', speakerName: '???', text: '……ここは、どこだ？', position: 'center' },
      { lineId: '4', type: 'narration', text: '深い霧に包まれた森の中。主人公は記憶を失った状態で目覚めた。' },
      { lineId: '5', type: 'dialogue', speakerName: '謎の少女', text: 'やっと目が覚めた！よかった……。あなたは森の奥で倒れていたのよ。', position: 'left' },
      { lineId: '6', type: 'dialogue', speakerName: '???', text: '君は……誰だ？俺は、俺は一体何者なんだ……？', position: 'center' },
      { lineId: '7', type: 'dialogue', speakerName: '謎の少女', text: '焦らないで。あなたが誰かは分からない。でも、あなたの手には——アルカナの紋章が輝いている。', position: 'left' },
      { lineId: '8', type: 'narration', text: '手の甲を見ると、古代の文字が光を放っていた。それは、召喚士の証——アルカナの目覚めを意味していた。' },
      { lineId: '9', type: 'dialogue', speakerName: '???', text: 'アルカナ……？' },
      { lineId: '10', type: 'dialogue', speakerName: '謎の少女', text: '説明は後で。今は——迫ってくる魔物を倒さないと！', position: 'left', effect: 'shake' },
    ],
  },
  {
    scenarioId: 'scenario_w1s2',
    questId: 'q_w1',
    stageId: 'w1-2',
    backgroundKey: 'ruins',
    lines: [
      { lineId: '1', type: 'narration', text: '魔物を倒した後、少女に連れられ二人は廃墟へと向かった。' },
      { lineId: '2', type: 'dialogue', speakerName: '謎の少女', text: 'ここが「始まりの遺跡」。昔はアルカナの聖剣が祀られていた場所よ。', position: 'left' },
      { lineId: '3', type: 'dialogue', speakerName: '???', text: '聖剣？' },
      { lineId: '4', type: 'dialogue', speakerName: '謎の少女', text: '伝説の剣——「アルカナブレイド」。それを使いこなせた者だけが、この世界の守護者になれるの。', position: 'left' },
      { lineId: '5', type: 'narration', text: '遺跡の奥に進むと、台座に何かが刺さっていた。しかしそれは今や錆び付き、輝きを失っていた。' },
      { lineId: '6', type: 'dialogue', speakerName: '謎の少女', text: 'あれが……アルカナブレイド。百年前の戦いで聖剣の輝きは失われた、って言われてた。でも——', position: 'left' },
      { lineId: '7', type: 'narration', text: 'その瞬間、主人公の手の紋章が強く輝き始めた。台座の剣が、それに呼応するように震えた。' },
      { lineId: '8', type: 'dialogue', speakerName: '???', text: 'この感覚……引き寄せられる。俺がこれを引き抜くべきなのか？', position: 'center' },
      { lineId: '9', type: 'dialogue', speakerName: '謎の少女', text: 'まって！その前に——遺跡の番人が来るわ！', position: 'left', effect: 'shake' },
    ],
  },
  {
    scenarioId: 'scenario_w1s3',
    questId: 'q_w1',
    stageId: 'w1-3',
    backgroundKey: 'forest',
    lines: [
      { lineId: '1', type: 'narration', text: '遺跡の深部で、二人は不気味な影の群れと対峙した。' },
      { lineId: '2', type: 'dialogue', speakerName: '謎の少女', text: '影の魔物……「シャドウ」たちよ。最近、急に数が増えてるの。', position: 'left' },
      { lineId: '3', type: 'dialogue', speakerName: '???', text: 'こいつらは一体、どこから来るんだ？', position: 'center' },
      { lineId: '4', type: 'dialogue', speakerName: '謎の少女', text: '闇の呪縛……「奈落の扉」が開き始めているの。それが溢れ出す闇の源よ。', position: 'left' },
      { lineId: '5', type: 'narration', text: '「奈落の扉」——それは太古の封印が弱まった証拠。世界の均衡が崩れ始めていた。' },
      { lineId: '6', type: 'dialogue', speakerName: '???', text: 'なぜ俺がそれを知る必要がある？', position: 'center' },
      { lineId: '7', type: 'dialogue', speakerName: '謎の少女', text: 'あなたの紋章——それはアルカナの使者の証。この世界の運命は、あなたにかかっているかもしれない。', position: 'left' },
      { lineId: '8', type: 'dialogue', speakerName: '???', text: '……わかった。今はこの魔物を倒すことだけ考えよう。', position: 'center', effect: 'flash' },
    ],
  },
  {
    scenarioId: 'scenario_w1s4',
    questId: 'q_w1',
    stageId: 'w1-4',
    backgroundKey: 'temple',
    lines: [
      { lineId: '1', type: 'narration', text: '影の魔物を退けた二人。少女は一人の老人の元へと連れていった。' },
      { lineId: '2', type: 'dialogue', speakerName: '老賢者クロン', text: 'ほう……君が召喚士として目覚めた者か。その紋章は嘘をつかない。', position: 'left' },
      { lineId: '3', type: 'dialogue', speakerName: '???', text: '召喚士……俺は本当にそういう者なのか？', position: 'center' },
      { lineId: '4', type: 'dialogue', speakerName: '老賢者クロン', text: '試してみるといい。手を目の前に——心の奥底にある力を呼び起こせ。', position: 'left' },
      { lineId: '5', type: 'narration', text: '主人公が手を差し伸べると、まばゆい光が溢れ出した。そこに現れたのは——一体の戦士の姿だった。' },
      { lineId: '6', type: 'dialogue', speakerName: '老賢者クロン', text: 'これが「召喚」の力……！アルカナの紋章が、異次元の存在を呼び寄せた！', position: 'left' },
      { lineId: '7', type: 'dialogue', speakerName: '???', text: 'こいつが……俺の仲間になるのか？', position: 'center' },
      { lineId: '8', type: 'dialogue', speakerName: '老賢者クロン', text: '召喚士は単独では戦わない。仲間を集め、導いてこそ真の力が宿る。さあ——君の旅が始まる！', position: 'left' },
    ],
  },
  {
    scenarioId: 'scenario_w1s5',
    questId: 'q_w1',
    stageId: 'w1-5',
    backgroundKey: 'ruins',
    lines: [
      { lineId: '1', type: 'narration', text: '賢者クロンから力の扱いを学んだ主人公。しかし、遺跡の最奥部に巨大な魔物の気配を感じた。' },
      { lineId: '2', type: 'dialogue', speakerName: '老賢者クロン', text: '「始まりの番人」……封印が弱まり、解き放たれてしまったか。', position: 'left' },
      { lineId: '3', type: 'dialogue', speakerName: '謎の少女', text: 'あの魔物を倒さないと、この遺跡は完全に闇に呑まれてしまう！', position: 'right' },
      { lineId: '4', type: 'dialogue', speakerName: '???', text: '……行こう。俺にはまだ力の使い方も分からないが——仲間がいれば戦える気がする。', position: 'center' },
      { lineId: '5', type: 'narration', text: '主人公の紋章が輝き、召喚した仲間たちが集まってきた。初めての本格的な戦いが、今始まろうとしていた。' },
      { lineId: '6', type: 'dialogue', speakerName: '謎の少女', text: 'あなたの名前……まだ聞いてなかったわ。', position: 'right' },
      { lineId: '7', type: 'dialogue', speakerName: '???', text: 'まだ思い出せない。でも——アルカナの召喚士として、この戦いを終わらせてみせる。', position: 'center' },
      { lineId: '8', type: 'narration', text: '第一章「アルカナ覚醒編」——始まりの戦いへ。', effect: 'flash' },
    ],
  },
];

export const getScenario = (stageId: string): ScenarioMaster | undefined =>
  SCENARIOS.find(s => s.stageId === stageId);

export const BG_STYLES: Record<string, string> = {
  forest:   'radial-gradient(ellipse at top, #071a0a 0%, #0d1f10 40%, #08081a 100%)',
  ruins:    'radial-gradient(ellipse at top, #1a1208 0%, #2a1e0d 30%, #08081a 100%)',
  temple:   'radial-gradient(ellipse at top, #0d0a1f 0%, #1a0a38 40%, #08081a 100%)',
  cave:     'radial-gradient(ellipse at top, #0a0a0a 0%, #101018 40%, #08081a 100%)',
  castle:   'radial-gradient(ellipse at top, #12081a 0%, #1e0e2e 40%, #08081a 100%)',
  sky:      'radial-gradient(ellipse at top, #061228 0%, #0d1f38 40%, #08081a 100%)',
  darkness: 'radial-gradient(ellipse at top, #050508 0%, #080808 40%, #08081a 100%)',
};

export const BG_ACCENT: Record<string, string> = {
  forest:   '#22c55e',
  ruins:    '#f59e0b',
  temple:   '#8b5cf6',
  cave:     '#6b7280',
  castle:   '#a855f7',
  sky:      '#3b82f6',
  darkness: '#4f46e5',
};
