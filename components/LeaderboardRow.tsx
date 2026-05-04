import { Link } from 'react-router-dom';

interface LeaderboardRowProps {
  rank: number;
  city: string;
  citySlug: string;
  metrics: { label: string; value: string }[];
  barValue?: number;
  barMax?: number;
  barColor?: string;
}

export default function LeaderboardRow({
  rank,
  city,
  citySlug,
  metrics,
  barValue,
  barMax = 100,
  barColor = '#047857',
}: LeaderboardRowProps) {
  const isTop3 = rank <= 3;
  const rankColors = ['bg-navy', 'bg-[#475569]', 'bg-[#64748B]'];

  return (
    <Link
      to={`/cities/${citySlug}`}
      className="flex items-center h-14 border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors duration-150 px-3 -mx-3"
    >
      {/* Rank */}
      <div className="w-10 shrink-0 flex items-center justify-center">
        {isTop3 ? (
          <div className={`w-7 h-7 ${rankColors[rank - 1]} rounded-full flex items-center justify-center`}>
            <span className="text-xs font-bold text-white">{rank}</span>
          </div>
        ) : (
          <span className="text-sm font-mono text-[#64748B]">{rank}</span>
        )}
      </div>

      {/* City name */}
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-[#0F172A] truncate block">{city}</span>
      </div>

      {/* Metrics */}
      <div className="flex items-center gap-6 shrink-0">
        {metrics.map((m) => (
          <div key={m.label} className="text-right w-[80px]">
            <span className="text-sm font-mono font-medium text-[#0F172A]">{m.value}</span>
          </div>
        ))}

        {/* Bar */}
        {barValue !== undefined && (
          <div className="w-[80px] hidden sm:block">
            <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${Math.min(100, (barValue / barMax) * 100)}%`,
                  backgroundColor: barColor,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
