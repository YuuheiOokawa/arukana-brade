interface Props {
  current: number;
  max: number;
  showNumbers?: boolean;
  height?: string;
}

export const HpBar = ({ current, max, showNumbers = false, height = 'h-2' }: Props) => {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));
  const colorClass = pct > 50 ? 'hp-bar-fill' : pct > 25 ? 'hp-bar-fill mid' : 'hp-bar-fill low';

  return (
    <div>
      {showNumbers && (
        <div className="text-xs text-gray-300 mb-0.5 text-right">
          {current.toLocaleString()} / {max.toLocaleString()}
        </div>
      )}
      <div className={`w-full bg-gray-700 rounded-full overflow-hidden ${height}`}>
        <div className={`${height} rounded-full ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};
