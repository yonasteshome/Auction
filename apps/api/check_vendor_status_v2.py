import os
import sys
import django

# Add the current directory to sys.path to find core_api and other apps
sys.path.append(os.getcwd())

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core_api.settings')
django.setup()

from users.models import Vendor

print(f"{'Shop Name':<25} | {'is_verified':<12} | {'status':<12} | {'owner':<25}")
print("-" * 80)
for v in Vendor.objects.all():
    print(f"{v.shop_name or 'N/A':<25} | {str(v.is_verified):<12} | {v.verification_status:<12} | {v.owner.email:<25}")
