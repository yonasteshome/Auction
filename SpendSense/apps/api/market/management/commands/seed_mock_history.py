import random
from datetime import date, timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction

from market.models import Item, PriceSubmission
from users.models import User


class Command(BaseCommand):
    help = 'Generate 60 days of mock approved price submissions for SARIMA training'

    def handle(self, *args, **options):
        # 1. Get or create a mock system user to be the 'submitter'
        system_user, _ = User.objects.get_or_create(
            email='seed@spendsense.io',
            defaults={
                'full_name': 'System Seed',
                'role': 'admin',
                'is_active': True
            }
        )
        if _:
            system_user.set_password('SeedPass123!')
            system_user.save()

        # 2. Get the items we want to seed (focusing on a few key ones)
        target_items = Item.objects.filter(name__in=['Teff', 'Wheat grain', 'Coffee (raw)', 'Sugar', 'Petrol'])
        
        if not target_items.exists():
            self.stdout.write(self.style.ERROR('No target items found. Please run seed_csa_items first.'))
            return

        base_prices = {
            'Teff': 150.00,
            'Wheat grain': 80.00,
            'Coffee (raw)': 450.00,
            'Sugar': 95.00,
            'Petrol': 110.00
        }

        cities = ['Addis Ababa', 'Bishoftu', 'Adama']
        days_of_history = 60
        total_created = 0

        self.stdout.write(f'Generating {days_of_history} days of history for {target_items.count()} items...')

        with transaction.atomic():
            for item in target_items:
                base_p = base_prices.get(item.name, 100.00)
                
                # Delete old history for these items to avoid duplicates if re-run
                PriceSubmission.objects.filter(item=item, user=system_user).delete()

                for day_offset in range(days_of_history):
                    check_date = date.today() - timedelta(days=day_offset)
                    
                    # Add some "random walk" and seasonality (slight upward trend)
                    # price = base + trend + noise
                    trend = (days_of_history - day_offset) * 0.1  # 0.1 ETB increase per day
                    noise = random.uniform(-2, 2)
                    
                    final_price = Decimal(base_p + trend + noise).quantize(Decimal('0.01'))

                    for city in cities:
                        PriceSubmission.objects.create(
                            user=system_user,
                            item=item,
                            price_value=final_price + Decimal(random.uniform(-5, 5)).quantize(Decimal('0.01')),
                            market_location='Sample Market',
                            city=city,
                            date_observed=check_date,
                            status='approved'
                        )
                        total_created += 1

        self.stdout.write(self.style.SUCCESS(f'Successfully created {total_created} approved submissions.'))
        self.stdout.write(self.style.MIGRATE_LABEL('You can now run the SARIMA retrain endpoint!'))
