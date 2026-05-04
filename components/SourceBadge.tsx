interface SourceBadgeProps {
  label: string;
  className?: string;
}

export default function SourceBadge({ label, className = '' }: SourceBadgeProps) {
  return (
    <span
      className={`h-8 px-3 border border-[#E2E8F0] rounded-md bg-white text-xs font-mono font-medium tracking-[0.05em] text-[#475569] inline-flex items-center hover:border-navy hover:bg-[#F8FAFC] transition-all duration-150 cursor-default ${className}`}
    >
      {label}
    </span>
  );
}
