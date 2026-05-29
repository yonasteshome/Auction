import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core_api.settings')
django.setup()

from django.db import connection

with connection.cursor() as cursor:
    cursor.execute('DROP TABLE IF EXISTS ecommerce_vendorreview CASCADE;')
    cursor.execute('DROP TABLE IF EXISTS ecommerce_transaction CASCADE;')
    cursor.execute('DROP TABLE IF EXISTS finance_expense CASCADE;')
    cursor.execute('DROP TABLE IF EXISTS finance_budgetcategory CASCADE;')
    cursor.execute('DROP TABLE IF EXISTS finance_budget CASCADE;')
    cursor.execute("DELETE FROM django_migrations WHERE app='ecommerce' OR app='finance';")

print("Tables and migration records dropped.")
