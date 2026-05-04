import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, CheckCircle, ArrowLeft } from 'lucide-react';
import Layout from '@/components/Layout';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      const response = await fetch('https://formspree.io/f/xwplgrej', {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      });
      if (response.ok) {
        setSubmitted(true);
        form.reset();
      }
    } catch {}
    setSubmitting(false);
  };

  return (
    <Layout>
      <section className="bg-white py-16 sm:py-20">
        <div className="container-page max-w-[640px]">
          <Link to="/about" className="inline-flex items-center gap-1.5 text-sm text-[#475569] hover:text-navy transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to About
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-[-0.02em] mb-3">Get in Touch</h1>
            <p className="text-[#475569] mb-10">Questions, feedback, or partnership ideas? We'd love to hear from you.</p>
          </motion.div>
          {submitted ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center py-16">
              <CheckCircle className="w-12 h-12 text-[#047857] mb-4" />
              <h2 className="text-xl font-semibold text-[#0F172A] mb-2">Message Sent</h2>
              <p className="text-[#475569]">Thanks for reaching out. We'll get back to you soon.</p>
              <button onClick={() => setSubmitted(false)} className="mt-6 text-sm text-navy hover:underline">Send another message</button>
            </motion.div>
          ) : (
            <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#0F172A] mb-1.5">Name</label>
                <input type="text" id="name" name="name" required className="w-full rounded-lg border border-[#E2E8F0] px-4 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors" placeholder="Your name" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#0F172A] mb-1.5">Email</label>
                <input type="email" id="email" name="email" required className="w-full rounded-lg border border-[#E2E8F0] px-4 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors" placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Type of Inquiry</label>
                <select name="type" required className="w-full rounded-lg border border-[#E2E8F0] px-4 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors bg-white">
                  <option value="">Select a type</option>
                  <option value="feedback">General Feedback</option>
                  <option value="bug">Bug Report</option>
                  <option value="partnership">Partnership</option>
                  <option value="press">Press Inquiry</option>
                </select>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-[#0F172A] mb-1.5">Message</label>
                <textarea id="message" name="message" required rows={5} className="w-full rounded-lg border border-[#E2E8F0] px-4 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors resize-none" placeholder="Tell us what's on your mind..." />
              </div>
              <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? 'Sending...' : <><Send className="w-4 h-4" /> Send Message</>}
              </button>
              <p className="text-xs text-[#94A3B8] text-center">We typically respond within 1–2 business days.</p>
            </motion.form>
          )}
        </div>
      </section>
    </Layout>
  );
}
