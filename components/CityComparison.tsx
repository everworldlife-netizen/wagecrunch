import { motion } from 'framer-motion';
interface ComparisonRow {
  label: string;
  cityAValue: string;
  cityBValue: string;
  delta: number;
  isHigherBetter?: boolean;
}

interface CityComparisonProps {
  cityA: string;
  cityB: string;
  rows: ComparisonRow[];
  insight: string;
}

export default function CityComparison({ cityA, cityB, rows, insight }: CityComparisonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: 0.4 }}
      className="card-base"
    >
      <h3 className="text-xl font-semibold text-[#0F172A] mb-5">
        {cityA} vs {cityB}
      </h3>

      <div className="space-y-1">
        {/* Header */}
        <div className="flex items-center text-xs font-medium text-[#64748B] pb-2 border-b border-[#E2E8F0]">
          <div className="flex-1">Metric</div>
          <div className="w-[100px] text-right">{cityA}</div>
          <div className="w-[80px] text-center">Diff</div>
          <div className="w-[100px] text-right">{cityB}</div>
        </div>

        {/* Rows */}
        {rows.map((row, i) => {
          const isPositive = row.isHigherBetter ? row.delta > 0 : row.delta < 0;
          const deltaColor = isPositive ? 'text-[#047857]' : 'text-[#DC2626]';
          const deltaBg = isPositive ? 'bg-[#ECFDF5]' : 'bg-[#FEF2F2]';

          return (
            <div
              key={i}
              className="flex items-center py-3 border-b border-[#E2E8F0] last:border-0 text-sm"
            >
              <div className="flex-1 font-medium text-[#0F172A]">{row.label}</div>
              <div className="w-[100px] text-right font-mono text-[#0F172A]">{row.cityAValue}</div>
              <div className="w-[80px] flex justify-center">
                <span className={`text-xs font-mono font-medium px-2 py-0.5 rounded-full ${deltaBg} ${deltaColor}`}>
                  {row.delta > 0 ? '+' : ''}{row.delta.toFixed(1)}
                </span>
              </div>
              <div className="w-[100px] text-right font-mono text-[#0F172A]">{row.cityBValue}</div>
            </div>
          );
        })}
      </div>

      {/* Insight */}
      <div className="mt-4 p-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
        <p className="text-sm text-[#475569]">{insight}</p>
      </div>
    </motion.div>
  );
}
