import { motion } from 'framer-motion';
import SourceBadge from './SourceBadge';

const sources = ['Employment', 'Community', 'Tax', 'Housing', 'Regional'];

export default function DataSourceStrip() {
  return (
    <section className="bg-[#F8FAFC] border-t border-[#E2E8F0] py-10">
      <div className="container-page text-center">
        <motion.h4
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="text-base font-semibold text-[#0F172A] mb-2"
        >
          Trusted. Transparent. Methodology-Driven.
        </motion.h4>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.3, ease: 'easeOut', delay: 0.05 }}
          className="text-sm text-[#475569] max-w-[600px] mx-auto mb-6"
        >
          WageCrunch uses verified market data from multiple sources to provide clear salary insights.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex flex-wrap items-center justify-center gap-2"
        >
          {sources.map((source, i) => (
            <motion.div
              key={source}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.06 * i }}
            >
              <SourceBadge label={source} />
            </motion.div>
          ))}
          <span className="text-xs text-[#94A3B8] ml-1">and more &rarr;</span>
        </motion.div>
      </div>
    </section>
  );
}
