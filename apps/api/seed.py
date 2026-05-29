import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core_api.settings')
django.setup()

from django.db import connection

with connection.cursor() as cursor:
    try:
        cursor.execute("ALTER TABLE market_item ADD COLUMN description text NOT NULL DEFAULT '';")
    except Exception as e:
        pass
    
    try:
        cursor.execute("ALTER TABLE market_item ADD COLUMN image varchar(100) DEFAULT NULL;")
    except Exception as e:
        pass
        
    price_submission_columns = [
        "ALTER TABLE market_pricesubmission ADD COLUMN IF NOT EXISTS unit varchar(30) NOT NULL DEFAULT '';",
        "ALTER TABLE market_pricesubmission ADD COLUMN IF NOT EXISTS vendor_name varchar(120) NOT NULL DEFAULT '';",
        "ALTER TABLE market_pricesubmission ADD COLUMN IF NOT EXISTS time_observed varchar(20) NOT NULL DEFAULT '';",
        "ALTER TABLE market_pricesubmission ADD COLUMN IF NOT EXISTS quality_grade varchar(60) NOT NULL DEFAULT '';",
        "ALTER TABLE market_pricesubmission ADD COLUMN IF NOT EXISTS quantity_available numeric(10, 2) NULL;",
        "ALTER TABLE market_pricesubmission ADD COLUMN IF NOT EXISTS notes text NOT NULL DEFAULT '';",
        "ALTER TABLE market_pricesubmission ADD COLUMN IF NOT EXISTS rejection_reason text NOT NULL DEFAULT '';",
        "ALTER TABLE market_pricesubmission ADD COLUMN IF NOT EXISTS outlier_flag boolean NOT NULL DEFAULT false;",
        "ALTER TABLE market_pricesubmission ADD COLUMN IF NOT EXISTS image varchar(100) NULL;",
    ]
    for sql in price_submission_columns:
        try:
            cursor.execute(sql)
        except Exception:
            pass

from django.core.management import call_command
call_command('seed_items')

from market.models import Item, PriceSubmission
from django.contrib.auth import get_user_model
from datetime import date, timedelta
import random

User = get_user_model()
demo_user = User.objects.filter(email='demo@spendsense.local').first()

if not demo_user:
    demo_user = User.objects.create(email='demo@spendsense.local', full_name='Demo')
    demo_user.set_password('DevPass123!')
    demo_user.save()

# Seed some price submissions to populate the trend chart and table
cities = ['Addis Ababa', 'Dire Dawa', 'Bahir Dar', 'Hawassa', 'Mekelle']
items = list(Item.objects.all())

print("Seeding submissions...")
for item in items:
    for city in cities:
        # Base price per item
        base_price = random.randint(10, 1000)
        
        # Add 15 submissions for the last 30 days
        for i in range(15):
            days_ago = random.randint(0, 30)
            PriceSubmission.objects.create(
                item=item,
                user=demo_user,
                price_value=base_price + random.randint(-5, 5),
                city=city,
                market_location=f"{city} Market Zone",
                date_observed=date.today() - timedelta(days=days_ago),
                status="approved"
            )

print("Done seeding items and submissions.")
