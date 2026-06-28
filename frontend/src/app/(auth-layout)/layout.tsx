import Link from 'next/link';
import { Truck, Flame, Star, ChevronRight } from 'lucide-react';

async function getCompanyInfo() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const res = await fetch(`${baseUrl}/api/v1/company-info`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

const TRUST_POINTS = [
  { icon: Truck,  text: 'Fast delivery — right to your doorstep' },
  { icon: Flame,  text: 'Fresh & quality products every order' },
  { icon: Star,   text: 'Loved by 50,000+ happy customers' },
];

const AuthRootLayout = async ({ children }: { children: React.ReactNode }) => {
  const company = await getCompanyInfo();
  const companyName = company?.name || 'Bahari Shop';
  const tagline = company?.tagline || 'Shop smart, live better';
  const description =
    company?.description ||
    "Bangladesh's trusted marketplace for quality products at the best prices.";
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen flex">
      {/* ── LEFT: Branded panel (desktop only) ────────────────── */}
      <div className="hidden lg:flex lg:w-[44%] xl:w-[42%] bg-[#09090f] flex-col relative overflow-hidden shrink-0">
        {/* Glow effects */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-500/60 to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[380px] h-[380px] bg-primary-500/6 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />

        {/* Floating food emoji decorations */}
        <span className="absolute top-[18%] right-10 text-5xl opacity-[0.07] animate-float select-none pointer-events-none">🍕</span>
        <span className="absolute top-[52%] right-8 text-4xl opacity-[0.06] animate-float animation-delay-2000 select-none pointer-events-none">🍔</span>
        <span className="absolute bottom-[18%] right-14 text-3xl opacity-[0.07] animate-float animation-delay-4000 select-none pointer-events-none">🌮</span>
        <span className="absolute top-[35%] left-6 text-3xl opacity-[0.05] animate-float animation-delay-2000 select-none pointer-events-none">🍜</span>

        <div className="relative flex flex-col h-full px-10 xl:px-14 py-10">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2.5 w-fit">
            {company?.logoUrl ? (
              <img src={company.logoUrl} alt={companyName} className="h-9 w-auto object-contain" />
            ) : (
              <>
                <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-primary-500/30">
                  {companyName.charAt(0)}
                </div>
                <span className="text-xl font-bold text-white tracking-tight">{companyName}</span>
              </>
            )}
          </Link>

          {/* Center content */}
          <div className="flex-1 flex flex-col justify-center py-12">
            {/* Tagline badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 w-fit mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse shrink-0" />
              <span className="text-[12px] text-primary-400 font-medium">{tagline}</span>
            </div>

            <h2 className="text-[2rem] xl:text-[2.25rem] font-bold text-white leading-[1.2] mb-4">
              Taste the best,
              <br />
              <span className="text-primary-400">at {companyName}</span>
            </h2>

            <p className="text-[13.5px] text-gray-500 leading-[1.85] max-w-[310px] mb-10">
              {description}
            </p>

            {/* Trust points */}
            <div className="space-y-3.5">
              {TRUST_POINTS.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center shrink-0">
                    <Icon size={14} className="text-primary-400" />
                  </div>
                  <span className="text-[13px] text-gray-500">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Panel footer */}
          <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
            <p className="text-[11px] text-gray-700">
              © {currentYear} {companyName}
            </p>
            <div className="flex items-center gap-4">
              {[
                { label: 'Terms', href: '/pages/terms-and-conditions' },
                { label: 'Privacy', href: '/pages/privacy-policy' },
              ].map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-[11px] text-gray-700 hover:text-primary-400 transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Form panel ─────────────────────────────────── */}
      <div
        className="flex-1 flex flex-col min-h-screen relative"
        style={{ background: 'linear-gradient(150deg, #fdf8f3 0%, #fff8f0 55%, #fdf5ea 100%)' }}
      >
        {/* Mobile-only top bar */}
        <header className="lg:hidden border-b border-orange-100/60 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="px-5 py-4 flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2">
              {company?.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt={companyName}
                  className="h-8 w-auto object-contain"
                />
              ) : (
                <>
                  <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center text-white font-bold text-sm shadow shadow-primary-500/20">
                    {companyName.charAt(0)}
                  </div>
                  <span className="text-[17px] font-bold text-gray-900">{companyName}</span>
                </>
              )}
            </Link>
            <Link
              href="/"
              className="flex items-center gap-1 text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors"
            >
              Shop <ChevronRight size={14} />
            </Link>
          </div>
        </header>

        {/* Form area — vertically centered */}
        <div className="flex-1 flex items-center justify-center px-5 sm:px-8 py-10 overflow-y-auto relative">
          {/* Decorative background food emojis */}
          <span className="absolute top-10 left-6 text-5xl opacity-[0.05] select-none pointer-events-none hidden sm:block">🍜</span>
          <span className="absolute bottom-20 right-8 text-4xl opacity-[0.05] select-none pointer-events-none hidden sm:block">🍣</span>
          <span className="absolute top-1/3 right-6 text-3xl opacity-[0.04] select-none pointer-events-none hidden sm:block">🧆</span>
          {children}
        </div>

        {/* Simple footer */}
        <footer className="border-t border-orange-100/50 px-5 py-4">
          <div className="max-w-md mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-[11px] text-gray-400">
              © {currentYear} <span className="font-medium text-gray-500">{companyName}</span>. All
              rights reserved.
            </p>
            <div className="flex items-center gap-5 text-[11px] text-gray-400">
              {[
                { label: 'Terms', href: '/pages/terms-and-conditions' },
                { label: 'Privacy', href: '/pages/privacy-policy' },
                { label: 'Help', href: '/pages/support-center' },
                { label: 'Contact', href: '/pages/contact-us' },
              ].map(({ label, href }) => (
                <Link key={href} href={href} className="hover:text-primary-500 transition-colors">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AuthRootLayout;
