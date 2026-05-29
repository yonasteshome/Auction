import os
import django

import sys
sys.path.append('.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core_api.settings')
django.setup()

from users.models import Vendor

def fix_vendor_data():
    print("Starting vendor data cleanup...")
    
    # 1. Vendors who are verified should have status 'verified'
    verified_vendors = Vendor.objects.filter(is_verified=True).exclude(verification_status='verified')
    count = verified_vendors.count()
    print(f"Found {count} verified vendors with incorrect status.")
    
    for v in verified_vendors:
        v.verification_status = 'verified'
        v.save(update_fields=['verification_status'])
        print(f"  Fixed: {v.shop_name}")

    # 2. Vendors with status 'verified' should have is_verified=True
    status_verified = Vendor.objects.filter(verification_status='verified', is_verified=False)
    count2 = status_verified.count()
    print(f"Found {count2} vendors with 'verified' status but is_verified=False.")
    
    for v in status_verified:
        v.is_verified = True
        v.save(update_fields=['is_verified'])
        print(f"  Fixed: {v.shop_name}")

    print("Cleanup complete.")

if __name__ == "__main__":
    fix_vendor_data()
