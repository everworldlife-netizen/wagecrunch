import { Link } from 'react-router-dom';


const productLinks = [
  { label: 'Calculator', href: '/calculator' },
  { label: 'Cities', href: '/cities' },
  { label: 'Jobs', href: '/jobs' },
  { label: 'Leaderboards', href: '/leaderboards' },
  { label: 'Compare', href: '/compare' },
];

const companyLinks = [
  { label: 'About', href: '/about' },
  { label: 'Methodology', href: '/methodology' },
  { label: 'Contact', href: '/about' },
  { label: 'Terms', href: '#' },
  { label: 'Privacy', href: '#' },
];


export default function Footer() {
  return (
    <footer className="bg-[#F8FAFC] border-t border-[#E2E8F0]">
      <div className="container-page py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Col 1: Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-navy rounded-[8px] flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 32 32" fill="none">
                  <path d="M8 10L12.5 22L16 14L19.5 22L24 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="font-bold text-base text-navy">WageCrunch</span>
            </Link>
            <p className="text-sm text-[#475569] max-w-[240px] mb-6">
              See what your salary is really worth.
            </p>
            <p className="text-xs text-[#94A3B8]">
              &copy; {new Date().getFullYear()} WageCrunch. All rights reserved.
            </p>
          </div>

          {/* Col 2: Product */}
          <div>
            <h4 className="text-sm font-semibold text-[#0F172A] mb-4">Product</h4>
            <ul className="space-y-2.5">
              {productLinks.map(link => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-[#475569] hover:text-navy transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Company */}
          <div>
            <h4 className="text-sm font-semibold text-[#0F172A] mb-4">Company</h4>
            <ul className="space-y-2.5">
              {companyLinks.map(link => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-[#475569] hover:text-navy transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact */}
          <div>
            <h4 className="text-sm font-semibold text-[#0F172A] mb-4">Contact</h4>
            <div className="flex flex-col gap-2 mb-4">
              <span className="text-sm text-[#475569]">Informational tool only</span>
            </div>
            <p className="text-xs text-[#94A3B8] font-medium tracking-wide">Informational tool only</p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-10 pt-8 border-t border-[#E2E8F0]">
          <p className="text-xs text-[#94A3B8] max-w-[640px]">
            WageCrunch is an informational tool only. All salary estimates, tax calculations, and cost-of-living data are estimates for educational purposes. Use at your own risk.
          </p>
        </div>
      </div>
    </footer>
  );
}
