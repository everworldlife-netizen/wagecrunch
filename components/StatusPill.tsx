interface StatusPillProps {
  status: 'healthy' | 'caution' | 'stressed' | 'info';
  children: React.ReactNode;
  className?: string;
}

export default function StatusPill({ status, children, className = '' }: StatusPillProps) {
  const styles = {
    healthy: 'bg-[#ECFDF5] text-[#065F46]',
    caution: 'bg-[#FFF7ED] text-[#C2410C]',
    stressed: 'bg-[#FEF2F2] text-[#B91C1C]',
    info: 'bg-[#DBEAFE] text-[#1D4ED8]',
  };

  return (
    <span className={`pill ${styles[status]} ${className}`}>
      {children}
    </span>
  );
}
