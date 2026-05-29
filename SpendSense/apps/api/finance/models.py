from django.db import models

class Budget(models.Model):
    user = models.ForeignKey('users.User', on_delete=models.CASCADE)
    month = models.IntegerField()
    year = models.IntegerField()
    total_limit = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=('user', 'month', 'year'),
                name='unique_budget_per_user_month_year',
            ),
        ]

class BudgetCategory(models.Model):
    budget = models.ForeignKey(Budget, related_name='categories', on_delete=models.CASCADE) 
    category_name = models.CharField(max_length=120) 
    limit_amount = models.DecimalField(max_digits=12, decimal_places=2)

class Expense(models.Model): 
    user = models.ForeignKey('users.User', on_delete=models.CASCADE) 
    category = models.CharField(max_length=120)
    item = models.ForeignKey('market.Item', on_delete=models.SET_NULL, null=True, blank=True) 
    amount = models.DecimalField(max_digits=12, decimal_places=2) 
    vendor = models.ForeignKey('users.Vendor', on_delete=models.SET_NULL, null=True, blank=True) 
    payment_method = models.CharField(max_length=50, null=True, blank=True) 
    date = models.DateField() 
    note = models.TextField(null=True, blank=True)
    receipt = models.ImageField(upload_to='receipts/', null=True, blank=True)