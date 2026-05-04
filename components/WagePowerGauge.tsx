import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface WagePowerGaugeProps {
  score: number;
  label: string;
  size?: number;
  delay?: number;
}

export default function WagePowerGauge({ score, label, size = 120, delay = 0 }: WagePowerGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 85) return '#047857';
    if (s >= 70) return '#2563EB';
    if (s >= 55) return '#F97316';
    if (s >= 40) return '#F97316';
    return '#DC2626';
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 1000;
      const start = performance.now();
      const animate = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        setAnimatedScore(Math.round(score * eased));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, delay);
    return () => clearTimeout(timer);
  }, [score, delay]);

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
        />
        {/* Fill arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(score)}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
        {/* Center text */}
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="central"
          className="font-mono font-bold"
          style={{
            fontSize: size === 120 ? '36px' : '28px',
            fill: '#0F172A',
            letterSpacing: '-0.02em',
          }}
        >
          {animatedScore}
        </text>
      </svg>
      <span className="text-[13px] font-medium text-[#475569] mt-2">{label}</span>
    </div>
  );
}
