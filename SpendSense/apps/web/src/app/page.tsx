import React from 'react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="bg-[#f6f6f8] text-[#111318] selection:bg-[#e2e6ff] selection:text-[#00174c] min-h-screen font-sans">
      {/* TopNavBar */}
      <header className="bg-white dark:bg-slate-950 shadow-sm sticky top-0 z-50 w-full">
        <nav className="flex justify-between items-center h-16 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="text-xl font-black text-[#135bec] tracking-tight">
            SpendSense Ethiopia
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/about" className="text-slate-600 dark:text-slate-400 font-medium hover:text-[#135bec] transition-colors">About</Link>
            <Link href="/help" className="text-slate-600 dark:text-slate-400 font-medium hover:text-[#135bec] transition-colors">Help</Link>
            <Link href="/terms" className="text-slate-600 dark:text-slate-400 font-medium hover:text-[#135bec] transition-colors">Terms</Link>
            <Link href="/privacy" className="text-slate-600 dark:text-slate-400 font-medium hover:text-[#135bec] transition-colors">Privacy</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-slate-600 dark:text-slate-400 font-medium px-4 py-2 hover:text-[#135bec] transition-all"
            >
              Login
            </Link>
            <Link 
              href="/register" 
              className="bg-[#135bec] text-white px-6 py-2 rounded-xl font-semibold shadow-sm hover:opacity-90 active:scale-95 transition-all"
            >
              Register
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col items-center text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e2e6ff] text-[#00174c] text-xs font-bold uppercase tracking-wider mb-8">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
              Fintech Excellence in Ethiopia
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-[#111318] tracking-tight leading-[1.1] mb-8 max-w-4xl">
              Master your money in <span className="text-[#135bec]">Ethiopia</span>
            </h1>
            
            <p className="text-[#616f89] text-lg md:text-xl max-w-2xl mb-12 leading-relaxed">
              A high-end editorial approach to personal finance. Track local market trends, set smart budget limits, and curate your financial journey with clinical precision.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup" className="bg-[#135bec] text-white px-10 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-[#135bec]/20 transition-all flex items-center justify-center gap-2">
                Get Started
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <button className="bg-white text-[#111318] px-10 py-4 rounded-xl font-bold text-lg border border-[#cbd5e1] hover:bg-[#f0f2f4] transition-all">
                View Demo
              </button>
            </div>

            {/* Mockup */}
            <div className="mt-20 w-full max-w-5xl aspect-[16/9] bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#cbd5e1]/30 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#135bec]/5 to-transparent"></div>
              <img 
                alt="Dashboard Preview" 
                className="w-full h-full object-cover opacity-90" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAo9zb7Rdg-Zhkt-IICdiFJQWxWXsOp6rP1HYiyrSKRICEBp2pPHyfdgIY9SqGpzvHy0qd8vYPNDZi0qEQa1Q28rlnMw6njPrfwfXPp6Me81tIMIn0INeCYEPoHlZCH58ojDbs2zact0S745ya11ph9roRxGPb81EuwAZSSFZa9E-fNaTBgS2j34ZojkF9MX9jelP62tFRbyrlc3yX_26HdHs0FDiOoRylGjiYSKfZoUpqvDWQCIuCJeiG3WIt9AmWMbYXNBGYBcNA" 
              />
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[500px] h-[500px] bg-[#135bec]/10 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[600px] h-[600px] bg-[#485c9a]/10 rounded-full blur-3xl opacity-50"></div>
        </section>

        {/* Features Bento Grid */}
        <section className="py-24 bg-[#f6f6f8]">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-[#111318] mb-4">The Informed Curator’s Toolkit</h2>
              <p className="text-[#616f89] max-w-xl">Everything you need to navigate the evolving financial landscape of Ethiopia with confidence and clarity.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Cost Tracking */}
              <div className="md:col-span-8 bg-white p-8 rounded-xl shadow-sm flex flex-col justify-between overflow-hidden relative group">
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-[#e2e6ff] text-[#135bec] rounded-lg flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined">account_balance_wallet</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Advanced Cost Tracking</h3>
                  <p className="text-[#616f89] max-w-md">Categorize every transaction across local banks and digital wallets. Gain a unified view of your net worth in real-time.</p>
                </div>
                <div className="mt-12 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtEnwEKmkPZaCbVgGjk0sRUxlhfE6t4-YLajItgK21ZoM_l7wyh2TBKpro3KFZOlrCHmYDJDcSIyRcrgNxliL3AIvNhwpZj45WAWWVMgXgt5s75yPno8mMEThaxrpOgSnQAynBbVCGtlrhipN_ruP9KZn0OVXMv97V3er5NVHgKw44pbxFE0ViGe8I9Y7fqyojg56YeoPLNRoukoXYYSzZRRZRFjTM-AtlOBmCelfWeRGX-OCft0JmCf1rjdfBjnoRZ-ZQEaaDyyc" alt="Spending" className="rounded-xl shadow-xl border border-[#cbd5e1]/50" />
                </div>
              </div>

              {/* Market Trends */}
              <div className="md:col-span-4 bg-[#135bec] p-8 rounded-xl shadow-sm text-white flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-white/20 text-white rounded-lg flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined">trending_up</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Market Insights</h3>
                  <p className="text-white/80">Stay ahead with localized inflation data and commodity price tracking tailored for the Ethiopian market.</p>
                </div>
                <div className="pt-8 border-t border-white/10 mt-8">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-widest font-bold text-white/60">ETB Market Pulse</span>
                    <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded">+12.4%</span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-white w-2/3"></div>
                  </div>
                </div>
              </div>

              {/* Budget Limits */}
              <div className="md:col-span-4 bg-[#e5e7eb] p-8 rounded-xl flex flex-col justify-center">
                <div className="w-12 h-12 bg-white text-[#135bec] rounded-lg flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined">notifications_active</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Precision Budgeting</h3>
                <p className="text-[#616f89]">Set hard limits for specific categories like dining, fuel, and utilities. Get notified before you overspend.</p>
              </div>

              {/* Savings Goals */}
              <div className="md:col-span-8 bg-white p-8 rounded-xl shadow-sm border border-[#cbd5e1]/30 flex items-center gap-8">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">Smart Savings Goals</h3>
                  <p className="text-[#616f89]">Automated rounding and recurring transfers designed for the way you earn and spend in Ethiopia.</p>
                </div>
                <div className="hidden sm:block w-40 h-40 bg-gradient-to-br from-[#135bec] to-[#485c9a] rounded-full flex-shrink-0 flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>savings</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
            <h2 className="text-4xl font-bold tracking-tight text-[#111318] mb-16">Three Steps to Financial Sovereignty</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { step: 1, icon: 'sync_alt', title: 'Connect Assets', desc: 'Securely link your Ethiopian bank accounts, Telebirr, or CBE Birr wallets in minutes.' },
                { step: 2, icon: 'analytics', title: 'Analyze Trends', desc: 'Our AI categorizes your spending habits and benchmarks them against local market shifts.' },
                { step: 3, icon: 'verified_user', title: 'Master Growth', desc: 'Execute data-driven decisions to grow your wealth using localized financial journals.' },
              ].map((item) => (
                <div key={item.step} className="relative group">
                  <div className="mb-8 relative inline-block">
                    <div className="w-20 h-20 bg-[#f0f2f4] rounded-2xl flex items-center justify-center text-[#135bec] group-hover:scale-110 transition-transform duration-300">
                      <span className="material-symbols-outlined text-4xl">{item.icon}</span>
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#135bec] text-white rounded-full flex items-center justify-center font-bold text-sm">{item.step}</div>
                  </div>
                  <h4 className="text-xl font-bold mb-4">{item.title}</h4>
                  <p className="text-[#616f89]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="bg-slate-900 rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3BJxyqx7bTaPeni6dcIT_anB5DSNGzY_5ksqcM9KSqdujAmExbUABxAR_KyBhTFNHHQk3lterxUrxHtesGBcsCyRA921I2BPh9iWYylA2W2Yod_ccQdvfHhlFclaN9I_0AyXMEHWicT6sbkPmiYM-RRZt77L3sS-_FAY9o_Fb8MygRPjfRWAzgssDJ-9p_zTJqJJ5NnbOTe-p_FtMkJJvKpfXgVpn0zowNzrmvQCt9gjuuNFds8lHMUyv_oqRLupj_Zpmu4NcrqI" alt="BG" className="w-full h-full object-cover" />
              </div>
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">Ready to curate your wealth?</h2>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10">Join thousands of Ethiopian professionals who are using SpendSense to simplify their financial lives.</p>
                <Link href="/signup" className="bg-[#135bec] text-white px-10 py-4 rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-[#135bec]/30 active:scale-95 transition-all inline-block">
                  Get Started Free
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#f6f6f8] dark:bg-slate-900 w-full border-t border-[#cbd5e1]/50">
        <div className="flex flex-col md:flex-row justify-between items-center py-10 px-6 md:px-12 max-w-7xl mx-auto gap-4">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100">SpendSense Ethiopia</div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">© 2024 SpendSense Ethiopia. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="#" className="text-slate-500 dark:text-slate-400 text-sm hover:underline hover:text-[#135bec]">Privacy Policy</Link>
            <Link href="#" className="text-slate-500 dark:text-slate-400 text-sm hover:underline hover:text-[#135bec]">Terms of Service</Link>
            <Link href="#" className="text-slate-500 dark:text-slate-400 text-sm hover:underline hover:text-[#135bec]">Contact Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}