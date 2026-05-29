from django.contrib import admin
from .models import Transaction, VendorReview, Category, Product

admin.site.register(Transaction)
admin.site.register(VendorReview)
admin.site.register(Category)
admin.site.register(Product)

