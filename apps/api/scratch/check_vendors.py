import os
import django
import sys

sys.path.append('.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core_api.settings')
django.setup()

from users.models import Vendor, User
from django.db.models import Count

def check_vendors():
    print("Checking for duplicate vendor records...")
    duplicates = Vendor.objects.values('owner').annotate(c=Count('id')).filter(c__gt=1)
    if duplicates.exists():
        print(f"Found {duplicates.count()} users with multiple vendor records!")
        for d in duplicates:
            user = User.objects.get(id=d['owner'])
            vendors = Vendor.objects.filter(owner=user)
            print(f"User: {user.email} has {vendors.count()} vendors:")
            for v in vendors:
                print(f"  - ID: {v.id}, Shop: {v.shop_name}, Verified: {v.is_verified}, Status: {v.verification_status}")
    else:
        print("No duplicate vendor records found.")

    print("\nRecent vendors and their status:")
    for v in Vendor.objects.select_related('owner').order_by('-joined_at')[:10]:
        print(f"Owner: {v.owner.email}, Shop: {v.shop_name}, Verified: {v.is_verified}, Status: {v.verification_status}")

if __name__ == "__main__":
    check_vendors()
