import os
import sys
import django

# Set environment variables
os.environ['DB_NAME'] = 'neondb'
os.environ['DB_USER'] = 'neondb_owner'
os.environ['DB_PASSWORD'] = 'npg_3TAaCd8vpLhE'
os.environ['DB_HOST'] = 'ep-silent-morning-alhwlv7z-pooler.c-3.eu-central-1.aws.neon.tech'
os.environ['DB_PORT'] = '5432'
os.environ['SECRET_KEY'] = 'b9809d318a08c7de206f0688bc048c998202ae4d917b49d0d5d02532650d9dba'
os.environ['DJANGO_SETTINGS_MODULE'] = 'core_api.settings'

# Add project root to path
sys.path.append(os.getcwd())

django.setup()

from users.models import Vendor, User

print(f"{'ID':<40} | {'Shop Name':<20} | {'Is Verified':<12} | {'Status':<15} | {'Owner Email':<30}")
print("-" * 125)
for v in Vendor.objects.all().select_related('owner'):
    print(f"{str(v.id):<40} | {v.shop_name:<20} | {str(v.is_verified):<12} | {v.verification_status:<15} | {v.owner.email:<30}")

# Check for users with multiple vendors
from django.db.models import Count
multi_vendors = Vendor.objects.values('owner__email').annotate(c=Count('id')).filter(c__gt=1)
if multi_vendors.exists():
    print("\nWARNING: Users with multiple vendors detected:")
    for mv in multi_vendors:
        print(f"User: {mv['owner__email']} has {mv['c']} vendors")
else:
    print("\nNo users with multiple vendors detected.")
