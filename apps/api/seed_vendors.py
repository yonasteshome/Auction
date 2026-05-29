import os
import django
from decimal import Decimal
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core_api.settings')
django.setup()

from market.models import Item, VendorPrice
from users.models import User, Vendor

demo_admin = User.objects.filter(role='admin').first()
if not demo_admin:
    demo_admin = User.objects.create(email='admin@spendsense.local', full_name='Admin', role='admin')
    demo_admin.set_password('DevPass123!')
    demo_admin.save()

# Create some vendors
vendor_data = [
    {"shop_name": "Ada'a Agricultural Union", "city": "Bishoftu", "rating_avg": 4.9, "is_verified": True},
    {"shop_name": "EthioGrain Global", "city": "Addis Ababa", "rating_avg": 4.2, "is_verified": True},
    {"shop_name": "Selam Multi-Action", "city": "Debre Zeit", "rating_avg": 4.5, "is_verified": True},
]

vendors = []
for vd in vendor_data:
    v, created = Vendor.objects.get_or_create(
        shop_name=vd["shop_name"],
        defaults={
            "owner": demo_admin,
            "city": vd["city"],
            "rating_avg": vd["rating_avg"],
            "is_verified": vd["is_verified"],
            "verification_status": "verified" if vd["is_verified"] else "unrequested"
        }
    )
    vendors.append(v)

items = list(Item.objects.all()[:5])

print("Seeding vendor prices...")
for item in items:
    base_price = random.randint(100, 5000)
    for v in vendors:
        price = base_price + random.randint(-50, 50)
        VendorPrice.objects.create(
            vendor=v,
            item=item,
            price=Decimal(str(price)),
            is_verified=v.is_verified
        )

print("Done seeding vendor prices.")
