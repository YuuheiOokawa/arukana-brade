interface Props {
  value: number; // 0-100
  size?: 'sm' | 'md';
}

export const BBGauge = ({ value, size = 'md' }: Props) => {
  const height = size === 'sm' ? 'h-1.5' : 'h-2';
  return (
    <div>
      {size === 'md' && (
        <div className="flex justify-between text-xs text-orange-400 mb-0.5">
          <span>BB</span>
          <span>{value}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-700 rounded-full overflow-hidden ${height}`}>
        <div className={`${height} bb-gauge-fill rounded-full`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
};
