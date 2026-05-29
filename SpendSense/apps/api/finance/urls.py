from django.urls import path

from . import views

app_name = 'finance'

urlpatterns = [
    path('reports/', views.FinanceReportSummaryView.as_view(), name='finance-reports-json'),
    path('budgets/history/', views.BudgetHistoryView.as_view(), name='budget-history'),
    path('budgets/suggestions/', views.BudgetSuggestionsView.as_view(), name='budget-suggestions'),
    path('budgets/<int:pk>/summary/', views.BudgetSummaryView.as_view(), name='budget-summary'),
    path('budgets/<int:pk>/', views.BudgetDetailView.as_view(), name='budget-detail'),
    path('budgets/', views.BudgetListCreateView.as_view(), name='budget-list'),
    path('expenses/<int:pk>/', views.ExpenseDetailView.as_view(), name='expense-detail'),
    path('expenses/', views.ExpenseListCreateView.as_view(), name='expense-list'),
    path('export/', views.FinanceExportView.as_view(), name='finance-export'),
]
