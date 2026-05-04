import { motion } from 'framer-motion';
import { UserX, Cpu, Cookie, BarChart3, ExternalLink, Lock, Users, RefreshCw } from 'lucide-react';
import Layout from '@/components/Layout';

const sections = [
  {
    icon: UserX,
    title: 'No PII Collection',
    body: 'We do not collect, store, or transmit any personally identifiable information. All salary inputs are processed locally in your browser.',
  },
  {
    icon: Cpu,
    title: 'Local Processing',
    body: 'Your salary, city, rent, and other inputs never leave your device. We have no servers receiving this data.',
  },
  {
    icon: Cookie,
    title: 'Cookies',
    body: 'We do not use tracking cookies. Any local storage is used solely for app preferences.',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    body: 'We use anonymous analytics to understand site traffic. No individual users are identified.',
  },
  {
    icon: ExternalLink,
    title: 'Third-Party Links',
    body: 'Our site may link to external resources. We are not responsible for their privacy practices.',
  },
  {
    icon: Lock,
    title: 'Data Security',
    body: "Since we don't collect personal data, there is no personal data to secure.",
  },
  {
    icon: Users,
    title: "Children's Privacy",
    body: 'This site is not directed at children under 13.',
  },
  {
    icon: RefreshCw,
    title: 'Changes',
    body: 'We may update this policy. Check this page for the latest version.',
  },
];

export default function Privacy() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-[#0B1E3C] py-12 sm:py-16">
        <div className="container-page max-w-[768px] text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
          >
            <span className="text-[13px] font-medium text-[#94A3B8] tracking-[0.1em] uppercase">
              Legal
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
            className="text-[32px] sm:text-[40px] font-bold text-white leading-[1.15] tracking-tight mt-4"
          >
            Privacy Policy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.3 }}
            className="text-[#94A3B8] text-base sm:text-lg leading-[1.7] mt-4"
          >
            Last updated: January 2025
          </motion.p>
        </div>
      </section>

      {/* Content */}
      <section className="bg-white py-12 sm:py-16">
        <div className="container-page max-w-[768px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.2 }}
            className="space-y-8"
          >
            {sections.map((section, i) => {
              const Icon = section.icon;
              return (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: 'easeOut', delay: 0.25 + i * 0.05 }}
                  className="border-b border-[#E2E8F0] pb-8 last:border-0"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center">
                      <Icon className="w-4.5 h-4.5 text-[#0B1E3C]" />
                    </div>
                    <h2 className="text-lg font-semibold text-[#0F172A]">{section.title}</h2>
                  </div>
                  <p className="text-sm text-[#475569] leading-[1.7] pl-12">{section.body}</p>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="text-xs text-[#94A3B8] mt-10 text-center"
          >
            If you have any questions about this Privacy Policy, please visit our Contact page.
          </motion.p>
        </div>
      </section>
    </Layout>
  );
}
