// 日付境界の判定はすべて「実行環境のローカル時刻」基準で統一する。
// Date.toISOString() は常に UTC に変換されるため、日本時間(UTC+9)等では
// デイリー/ウィークリーリセットの境界が実際の 0:00 からズレてしまう
// （UTC 0:00 = JST 9:00 にリセットされる、または日付跨ぎの端数で1日早くリセットされる等）。
export const localDateStr = (date: Date = new Date()): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// その週の月曜日の日付文字列（ローカル時刻基準）
export const localWeekMondayStr = (date: Date = new Date()): string => {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return localDateStr(new Date(date.getFullYear(), date.getMonth(), diff));
};
