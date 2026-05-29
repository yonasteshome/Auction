import os
import django
import sys

# Set up Django environment
sys.path.append('c:\\Users\\HP\\Documents\\Projects\\SpendSense\\apps\\api')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core_api.settings')
django.setup()

from users.models import Vendor, User

def check_vendors():
    pending = Vendor.objects.filter(verification_status='pending').select_related('owner').order_by('-joined_at')
    print(f"Pending Vendors ({pending.count()}):")
    print(f"{'ID':<40} {'Shop Name':<30} {'Status':<15} {'Verified':<10} {'Owner Email'}")
    print("-" * 110)
    for v in pending:
        print(f"{str(v.id):<40} {v.shop_name:<30} {v.verification_status:<15} {str(v.is_verified):<10} {v.owner.email}")

    recently_verified = Vendor.objects.filter(verification_status='verified').order_by('-joined_at')[:5]
    print("\nRecently Verified Vendors:")
    for v in recently_verified:
        print(f"{str(v.id):<40} {v.shop_name:<30} {v.verification_status:<15}")

if __name__ == "__main__":
    check_vendors()
