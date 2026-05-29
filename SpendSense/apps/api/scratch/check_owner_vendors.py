import os
import django
import sys

# Set up Django environment
sys.path.append('c:\\Users\\HP\\Documents\\Projects\\SpendSense\\apps\\api')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core_api.settings')
django.setup()

from users.models import Vendor, User

def check_owner_vendors():
    email = 'bartoz@gmail.com'
    try:
        user = User.objects.get(email=email)
        vendors = Vendor.objects.filter(owner=user)
        print(f"User: {email}")
        print(f"Vendor count: {vendors.count()}")
        for v in vendors:
            print(f"  - ID: {v.id}, Shop: {v.shop_name}, Verified: {v.is_verified}, Status: {v.verification_status}")
    except User.DoesNotExist:
        print("User not found.")

if __name__ == "__main__":
    check_owner_vendors()
