import os
import django
import sys

# Set up Django environment
sys.path.append('c:\\Users\\HP\\Documents\\Projects\\SpendSense\\apps\\api')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core_api.settings')
django.setup()

from users.models import Vendor, User

def check_vendors():
    unverified = Vendor.objects.filter(is_verified=False).select_related('owner').order_by('-joined_at')
    print(f"Unverified Vendors ({unverified.count()}):")
    print(f"{'ID':<40} {'Shop Name':<30} {'Status':<15} {'Owner Email'}")
    print("-" * 100)
    for v in unverified[:20]:
        print(f"{str(v.id):<40} {v.shop_name:<30} {v.verification_status:<15} {v.owner.email}")

if __name__ == "__main__":
    check_vendors()
