import { CategoryCard } from "@/components/finance/category-card";
import { BudgetSummaryCategory, EditableCategory } from "@/types/finance";

interface BudgetCategoriesSectionProps {
  draftCategories: EditableCategory[];
  spentByCategory: Map<string, BudgetSummaryCategory>;
  onLimitChange: (categoryName: string, nextValue: string) => void;
}

export function BudgetCategoriesSection({
  draftCategories,
  spentByCategory,
  onLimitChange,
}: BudgetCategoriesSectionProps) {
  return (
    <section className="space-y-4 xl:col-span-8">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Budget Categories</h2>

      {draftCategories.length === 0 ? (
        <div className="rounded-xl border border-[#dbdfe6] bg-white p-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
          No categories available.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {draftCategories.map((category) => (
            <CategoryCard
              key={category.category_name}
              category={category}
              stat={spentByCategory.get(category.category_name.toLowerCase())}
              onLimitChange={onLimitChange}
            />
          ))}
        </div>
      )}
    </section>
  );
}
