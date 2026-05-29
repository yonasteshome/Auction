from users.models import Vendor
print(f"{'ID':<40} | {'Shop Name':<20} | {'Is Verified':<12} | {'Status':<15} | {'Owner Email':<30}")
print('-' * 125)
for v in Vendor.objects.all():
    print(f"{str(v.id):<40} | {v.shop_name:<20} | {str(v.is_verified):<12} | {v.verification_status:<15} | {v.owner.email:<30}")
