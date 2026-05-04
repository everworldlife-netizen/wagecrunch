import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Clock, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { getAllDataFreshness, formatFreshnessDate, type DataSourceFreshness } from '@/data/freshness';

export default function DataStatusBar() {
  const [freshness, setFreshness] = useState<DataSourceFreshness[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setFreshness(getAllDataFreshness());
  }, []);

  const staleCount = freshness.filter(f => f.status === 'stale').length;
  const currentCount = freshness.filter(f => f.status === 'current').length;

  return (
    <div className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
      <div className="container-page py-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-xs text-[#64748B] hover:text-[#0F172A] transition-colors w-full"
        >
          <Database className="w-3.5 h-3.5" />
          <span>
            {currentCount} data sources current
            {staleCount > 0 && ` · ${staleCount} stale`}
          </span>
          <span className="ml-auto flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            Last data refresh: {freshness[0]?.lastUpdated ? formatFreshnessDate(freshness[0].lastUpdated) : 'N/A'}
          </span>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-2 pt-2 border-t border-[#E2E8F0] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {freshness.map((source) => (
                  <div
                    key={source.source}
                    className="flex items-start gap-2 p-2 rounded-lg bg-white border border-[#E2E8F0]"
                  >
                    {source.status === 'current' ? (
                      <CheckCircle className="w-3.5 h-3.5 text-[#047857] shrink-0 mt-0.5" />
                    ) : source.status === 'stale' ? (
                      <AlertCircle className="w-3.5 h-3.5 text-[#F97316] shrink-0 mt-0.5" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5 text-[#2563EB] shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-xs font-medium text-[#0F172A]">{source.source}</p>
                      <p className="text-[11px] text-[#64748B]">
                        Updated {formatFreshnessDate(source.lastUpdated)}
                      </p>
                      <p className="text-[11px] text-[#94A3B8]">
                        Next: {source.nextScheduledUpdate}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
