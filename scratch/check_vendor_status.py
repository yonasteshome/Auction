import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'spend_sense.settings')
django.setup()

from users.models import Vendor

print(f"{'Shop Name':<20} | {'is_verified':<12} | {'status':<12} | {'owner':<20}")
print("-" * 70)
for v in Vendor.objects.all():
    print(f"{v.shop_name:<20} | {v.is_verified:<12} | {v.verification_status:<12} | {v.owner.email:<20}")
