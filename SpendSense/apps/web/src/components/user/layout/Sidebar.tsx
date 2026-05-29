import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="h-screen w-64 fixed left-0 top-0 border-r-0 bg-[#f6f6f8] dark:bg-slate-950 flex flex-col py-6 z-50">
      <div className="px-6 mb-10 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-sm shadow-primary/20">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#135bec] leading-none">SpendSense</h1>
          <p className="text-[10px] font-semibold text-on-surface-variant tracking-widest uppercase mt-1">Ethiopia</p>
        </div>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-slate-500 font-medium hover:bg-[#f0f2f4] transition-colors rounded-xl">
          <span className="material-symbols-outlined">dashboard</span>
          <span>Dashboard</span>
        </Link>
        <Link href="/market" className="flex items-center gap-3 px-4 py-3 text-slate-500 font-medium hover:bg-[#f0f2f4] transition-colors rounded-xl">
          <span className="material-symbols-outlined">storefront</span>
          <span>Market</span>
        </Link>
        {/* Active Budget Nav */}
        <Link href="/budget" className="flex items-center gap-3 px-4 py-3 text-[#135bec] font-bold border-r-4 border-[#135bec] bg-blue-50/50 rounded-l-xl">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
          <span>Finance & Budget</span>
        </Link>
        <Link href="/shop" className="flex items-center gap-3 px-4 py-3 text-slate-500 font-medium hover:bg-[#f0f2f4] transition-colors rounded-xl">
          <span className="material-symbols-outlined">shopping_cart</span>
          <span>Smart Shopping</span>
        </Link>
      </nav>
      <div className="mt-auto px-4 pt-6 space-y-1">
        <Link href="/settings" className="flex items-center gap-3 px-4 py-3 text-slate-500 font-medium hover:bg-[#f0f2f4] transition-colors rounded-xl">
          <span className="material-symbols-outlined">settings</span>
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}