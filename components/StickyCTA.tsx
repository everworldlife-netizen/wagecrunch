import { useEffect, useState } from 'react';

interface StickyCTAProps {
  resultsRef: React.RefObject<HTMLElement | null>;
  onClick: () => void;
  isFirstLoad: boolean;
}

export default function StickyCTA({ resultsRef, onClick, isFirstLoad }: StickyCTAProps) {
  const [resultsInView, setResultsInView] = useState(false);

  useEffect(() => {
    const el = resultsRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setResultsInView(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '-20% 0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [resultsRef]);

  return (
    <div
      className={`lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-sm border-t border-[#E2E8F0] z-50 transition-opacity duration-300 ${
        resultsInView ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
      }}
    >
      <button onClick={onClick} className="btn-primary w-full">
        {isFirstLoad ? 'Crunch My Wage' : 'Update Results'}
      </button>
    </div>
  );
}
