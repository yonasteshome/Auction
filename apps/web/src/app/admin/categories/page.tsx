import { Download, Edit3, Trash2 } from "lucide-react";
import AdminPanelShell from "../_components/admin-panel-shell";

type Category = {
  name: string;
  description: string;
  badge: string;
  count: string;
  statusTone: "green" | "blue" | "gray";
};

const categories: Category[] = [
  {
    name: "Grains & Pulses",
    description: "Core agricultural commodities including Teff, Barley, and Wheat.",
    badge: "Active",
    count: "124 Items Registered",
    statusTone: "green",
  },
  {
    name: "Electronics",
    description: "Consumer tech, mobile hardware, and office computing infrastructure.",
    badge: "Active",
    count: "89 Items Registered",
    statusTone: "green",
  },
  {
    name: "Wholesalers",
    description: "B2B vendors specializing in bulk distribution of fast-moving goods.",
    badge: "Vendor Type",
    count: "42 Vendors Linked",
    statusTone: "blue",
  },
  {
    name: "Processed Food",
    description: "Packaged goods, dairy products, and international imports.",
    badge: "Paused",
    count: "210 Items Registered",
    statusTone: "gray",
  },
];

const iconChoices = ["grass", "devices", "shopping_bag", "local_shipping", "restaurant"];

export default function CategoriesManagementPage() {
  return (
    <AdminPanelShell
      activeTab="categories"
      subtitle="Standardize pricing intelligence by managing taxonomy for item and vendor classifications."
      title="Category Management"
    >
      <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-12">
        <section className="xl:col-span-4 xl:sticky xl:top-24">
          <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="border-b border-slate-100 p-6">
              <h3 className="text-lg font-bold text-slate-900">Add New Category</h3>
            </div>
            <form className="space-y-6 p-6">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Category Label</label>
                <input
                  className="w-full rounded-lg border-none bg-slate-100 px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="e.g. Teff Grains"
                  type="text"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Icon Selection</label>
                <div className="grid grid-cols-5 gap-2">
                  {iconChoices.map((icon, index) => (
                    <button
                      key={icon}
                      className={[
                        "aspect-square rounded-lg text-sm transition-colors",
                        index === 0 ? "bg-blue-600 font-bold text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                      ].join(" ")}
                      type="button"
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Taxonomy Type</label>
                <select className="w-full rounded-lg border-none bg-slate-100 px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-blue-200">
                  <option>Item Category</option>
                  <option>Vendor Category</option>
                </select>
              </div>

              <button className="w-full rounded-xl bg-blue-600 py-3.5 font-bold text-white shadow-lg shadow-blue-200" type="submit">
                Register Category
              </button>
            </form>
          </div>
        </section>

        <section className="xl:col-span-8">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">Existing Categories</h3>
            <div className="flex gap-2">
              <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700" type="button">
                <Download size={14} /> Export CSV
              </button>
              <button className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700" type="button">
                Bulk Actions
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {categories.map((category) => (
              <article key={category.name} className="group rounded-xl border border-transparent bg-white p-6 shadow-sm transition-all hover:border-blue-200">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-sm font-bold text-blue-700">CAT</div>
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-700" type="button"><Edit3 size={16} /></button>
                    <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-red-600" type="button"><Trash2 size={16} /></button>
                  </div>
                </div>
                <h4 className="text-lg font-bold text-slate-900">{category.name}</h4>
                <p className="mb-4 mt-1 text-sm text-slate-500">{category.description}</p>
                <div className="flex items-center gap-4">
                  <span
                    className={[
                      "rounded px-2 py-1 text-[10px] font-bold uppercase tracking-tight",
                      category.statusTone === "green" && "bg-green-100 text-green-700",
                      category.statusTone === "blue" && "bg-blue-100 text-blue-700",
                      category.statusTone === "gray" && "bg-slate-200 text-slate-600",
                    ].join(" ")}
                  >
                    {category.badge}
                  </span>
                  <span className="text-xs font-medium text-slate-500">{category.count}</span>
                </div>
              </article>
            ))}
          </div>

          <div className="relative mt-8 overflow-hidden rounded-2xl bg-blue-600 p-8 text-white">
            <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div>
                <h3 className="text-2xl font-black">Semantic Categorization</h3>
                <p className="mt-2 max-w-md text-sm text-blue-100">Our ML models use these categories to refine price sensitivity analysis for Addis Ababa and other regions.</p>
              </div>
              <div className="flex gap-10">
                <div className="text-center">
                  <p className="text-3xl font-black">18</p>
                  <p className="text-[10px] uppercase tracking-widest text-blue-100">Total Groups</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-black">94%</p>
                  <p className="text-[10px] uppercase tracking-widest text-blue-100">ML Accuracy</p>
                </div>
              </div>
            </div>
            <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
          </div>
        </section>
      </div>
    </AdminPanelShell>
  );
}
