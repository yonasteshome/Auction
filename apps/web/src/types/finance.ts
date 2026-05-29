// types/finance.ts

export type BudgetCategory = {
  id?: number;
  category_name: string;
  limit_amount: string;
};

export type BudgetRecord = {
  id: number;
  month: number;
  year: number;
  total_limit: string;
  categories: BudgetCategory[];
  created_at: string;
};

export type BudgetSuggestionResponse = {
  month: number;
  year: number;
  suggested_total: string;
  categories: BudgetCategory[];
};

export type BudgetSummaryCategory = {
  category_name: string;
  limit_amount: string;
  spent: string;
  remaining: string;
  percent_used: number;
  warning_80: boolean;
  warning_100: boolean;
};

export type BudgetSummary = {
  budget_id: number;
  month: number;
  year: number;
  total_limit: string;
  total_spent: string;
  remaining: string;
  percent_total_used: number;
  warning_total_80: boolean;
  warning_total_100: boolean;
  by_category: BudgetSummaryCategory[];
};

export type BudgetSuggestion = {
  month: number;
  year: number;
  suggested_total: string;
  categories: {
    category_name: string;
    limit_amount: string;
  }[];
}


export type ExpenseRecord = {
  id: number;
  category: string;
  amount: string;
  date: string;
  description?: string;
  payment_method?: string;
  item?: number;
  vendor?: string;
};

export type EditableCategory = {
  category_name: string;
  limit_amount: string;
};