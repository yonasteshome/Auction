import os
import django
import sys

# Set up Django environment
sys.path.append('c:\\Users\\HP\\Documents\\Projects\\SpendSense\\apps\\api')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core_api.settings')
django.setup()

from users.models import Vendor

def check_vendor_details():
    vendor_id = '4baf5008-8fa4-4fbb-8ad9-ec8d9aa48e75'
    try:
        v = Vendor.objects.select_related('owner').get(id=vendor_id)
        print(f"Vendor: {v.shop_name}")
        print(f"Status: {v.verification_status}")
        print(f"Is Verified: {v.is_verified}")
        print(f"Owner: {v.owner.email}")
        print(f"Owner Role: {v.owner.role}")
    except Vendor.DoesNotExist:
        print("Vendor not found.")

if __name__ == "__main__":
    check_vendor_details()
