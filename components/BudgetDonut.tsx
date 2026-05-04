import { useCallback, useState } from 'react';
import { PieChart, Pie, Cell, Sector } from 'recharts';
interface BudgetItem {
  category: string;
  amount: number;
  color: string;
  percent: number;
}

interface BudgetDonutProps {
  data: BudgetItem[];
  centerLabel: string;
  centerSubLabel: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderActiveShape = (props: any) => {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value,
  } = props;

  return (
    <g>
      <text x={cx} y={cy - 8} dy={0} textAnchor="middle" fill="#0F172A" className="font-mono font-bold" style={{ fontSize: '22px', letterSpacing: '-0.02em' }}>
        ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="#475569" style={{ fontSize: '12px' }}>
        {payload.category} ({(percent * 100).toFixed(0)}%)
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 4}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
    </g>
  );
};

export default function BudgetDonut({ data, centerLabel, centerSubLabel }: BudgetDonutProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  const onPieEnter = useCallback((_: unknown, index: number) => {
    setActiveIndex(index);
  }, []);

  const onPieLeave = useCallback(() => {
    setActiveIndex(undefined);
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <PieChart width={260} height={260}>
          <Pie
            activeIndex={activeIndex}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            activeShape={renderActiveShape as any}
            data={data}
            cx={130}
            cy={130}
            innerRadius={75}
            outerRadius={100}
            dataKey="amount"
            nameKey="category"
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            strokeWidth={0}
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
        {activeIndex === undefined && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="font-mono font-bold text-xl text-[#0F172A]">{centerLabel}</span>
            <span className="text-xs text-[#64748B] mt-0.5">{centerSubLabel}</span>
          </div>
        )}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-2">
        {data.map((item) => (
          <div key={item.category} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-xs text-[#475569]">{item.category}</span>
            <span className="text-xs font-mono font-medium text-[#0F172A]">
              ${Math.round(item.amount).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
