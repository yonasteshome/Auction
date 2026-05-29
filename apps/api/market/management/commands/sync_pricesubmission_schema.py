"""Apply missing market_pricesubmission columns. Run: python manage.py sync_pricesubmission_schema"""

from django.core.management.base import BaseCommand
from django.db import connection

COLUMNS_SQL = [
    "ALTER TABLE market_pricesubmission ADD COLUMN IF NOT EXISTS unit varchar(30) NOT NULL DEFAULT '';",
    "ALTER TABLE market_pricesubmission ADD COLUMN IF NOT EXISTS vendor_name varchar(120) NOT NULL DEFAULT '';",
    "ALTER TABLE market_pricesubmission ADD COLUMN IF NOT EXISTS time_observed varchar(20) NOT NULL DEFAULT '';",
    "ALTER TABLE market_pricesubmission ADD COLUMN IF NOT EXISTS quality_grade varchar(60) NOT NULL DEFAULT '';",
    "ALTER TABLE market_pricesubmission ADD COLUMN IF NOT EXISTS quantity_available numeric(10, 2) NULL;",
    "ALTER TABLE market_pricesubmission ADD COLUMN IF NOT EXISTS notes text NOT NULL DEFAULT '';",
    "ALTER TABLE market_pricesubmission ADD COLUMN IF NOT EXISTS rejection_reason text NOT NULL DEFAULT '';",
    "ALTER TABLE market_pricesubmission ADD COLUMN IF NOT EXISTS outlier_flag boolean NOT NULL DEFAULT false;",
    "ALTER TABLE market_pricesubmission ADD COLUMN IF NOT EXISTS image varchar(100) NULL;",
    "ALTER TABLE market_pricesubmission ADD COLUMN IF NOT EXISTS latitude numeric(9, 6) NULL;",
    "ALTER TABLE market_pricesubmission ADD COLUMN IF NOT EXISTS longitude numeric(9, 6) NULL;",
]


class Command(BaseCommand):
    help = "Add PriceSubmission model columns missing from the database."

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            for sql in COLUMNS_SQL:
                cursor.execute(sql)
                self.stdout.write(self.style.SUCCESS(f"Applied: {sql[:55]}..."))
        self.stdout.write(self.style.SUCCESS("Schema sync complete."))
