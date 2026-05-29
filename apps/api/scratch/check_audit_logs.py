import os
import django
import sys

# Set up Django environment
sys.path.append('c:\\Users\\HP\\Documents\\Projects\\SpendSense\\apps\\api')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core_api.settings')
django.setup()

from users.models import AuditLog

def check_audit_logs():
    logs = AuditLog.objects.filter(action__in=['vendor_verify', 'vendor_reject']).order_by('-created_at')[:10]
    print(f"Recent Audit Logs ({logs.count()}):")
    print(f"{'Time':<25} {'Action':<15} {'Resource ID':<40} {'Actor'}")
    print("-" * 100)
    for log in logs:
        print(f"{str(log.created_at):<25} {log.action:<15} {log.resource_id:<40} {log.actor.email if log.actor else 'System'}")

if __name__ == "__main__":
    check_audit_logs()
