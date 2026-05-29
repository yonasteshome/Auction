import os
import sys
import django

# Add the project root to sys.path
sys.path.append(os.path.join(os.getcwd(), 'apps', 'api'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core_api.settings')
django.setup()

from users.models import Vendor, User
from django.db.models import Count

def check_vendors():
    print(f'Total Vendors: {Vendor.objects.count()}')
    print(f'Total Users: {User.objects.count()}')
    print(f'Total Users with role vendor: {User.objects.filter(role="vendor").count()}')
    
    vendors_by_owner = Vendor.objects.values('owner', 'owner__email').annotate(count=Count('id')).order_by('-count')
    print("\nVendors per owner:")
    for v in vendors_by_owner:
        if v['count'] > 0:
            print(f"Owner: {v['owner__email']} (ID: {v['owner']}) - {v['count']} vendor records")
            
            # List statuses for this owner
            owner_vendors = Vendor.objects.filter(owner_id=v['owner'])
            for ov in owner_vendors:
                print(f"  - Vendor ID: {ov.id}, Status: {ov.verification_status}, Verified: {ov.is_verified}")

if __name__ == "__main__":
    check_vendors()
