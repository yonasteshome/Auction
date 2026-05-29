import os
import django
import sys

# Set up Django environment
sys.path.append('c:\\Users\\HP\\Documents\\Projects\\SpendSense\\apps\\api')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core_api.settings')
django.setup()

from users.models import Vendor, User

def check_vendors():
    vendors = Vendor.objects.select_related('owner').all().order_by('-joined_at')
    print(f"{'ID':<40} {'Shop Name':<30} {'Status':<15} {'Verified':<10} {'Owner Email'}")
    print("-" * 110)
    for v in vendors[:20]:
        print(f"{str(v.id):<40} {v.shop_name:<30} {v.verification_status:<15} {str(v.is_verified):<10} {v.owner.email}")

if __name__ == "__main__":
    check_vendors()
