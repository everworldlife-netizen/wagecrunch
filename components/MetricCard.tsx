import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import StatusPill from './StatusPill';

interface MetricCardProps {
  label: string;
  value: string;
  subtitle?: string;
  subtitleColor?: string;
  caption?: string;
  captionColor?: string;
  pill?: {
    status: 'healthy' | 'caution' | 'stressed' | 'info';
    label: string;
  };
  tooltip?: string;
  delay?: number;
  children?: ReactNode;
}

export default function MetricCard({
  label,
  value,
  subtitle,
  subtitleColor,
  caption,
  captionColor,
  pill,
  tooltip,
  delay = 0,
  children,
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: 'easeOut',
        delay,
      }}
      className="card-base"
    >
      {/* Label row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-medium text-[#475569] tracking-[0.02em]">{label}</span>
          {tooltip && (
            <div className="group relative">
              <Info className="w-4 h-4 text-[#94A3B8] hover:text-navy cursor-help transition-colors" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#0F172A] text-white text-xs rounded-lg max-w-[220px] whitespace-normal opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 pointer-events-none z-10">
                {tooltip}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0F172A] rotate-45 -mt-1" />
              </div>
            </div>
          )}
        </div>
        {pill && <StatusPill status={pill.status}>{pill.label}</StatusPill>}
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1.5">
        <span className="text-[36px] font-bold font-mono text-[#0F172A] leading-none tracking-[-0.02em]">
          {value}
        </span>
        {subtitle && (
          <span className="text-sm font-mono" style={{ color: subtitleColor || '#475569' }}>{subtitle}</span>
        )}
      </div>

      {/* Caption */}
      {caption && (
        <p className="text-xs mt-2" style={{ color: captionColor || '#64748B' }}>{caption}</p>
      )}

      {children}
    </motion.div>
  );
}
