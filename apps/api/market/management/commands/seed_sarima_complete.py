"""
Comprehensive seed file for SARIMA model testing.
Creates users, items, and realistic price history data.
Run: python manage.py seed_sarima_complete
"""
import random
from datetime import date, timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction

from market.models import Item, PriceSubmission, ForecastRun
from users.models import User


class Command(BaseCommand):
    help = 'Comprehensive seed for SARIMA model with users, items, and price history'

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_LABEL('=== SARIMA Complete Seed ==='))
        
        # Step 1: Create users
        admin_user = self._create_users()
        
        # Step 2: Create CSA items (if not already present)
        items = self._ensure_items_exist()
        
        # Step 3: Create realistic price history
        submissions_count = self._create_price_history(admin_user, items)
        
        # Step 4: Summary
        self.stdout.write(self.style.SUCCESS(
            f'\n✓ Seed Complete!\n'
            f'  - Admin User: {admin_user.email}\n'
            f'  - Items: {items.count()}\n'
            f'  - Price Submissions: {submissions_count}\n'
            f'\nYou can now train the SARIMA model!'
        ))
    
    def _create_users(self):
        """Create admin and test users."""
        self.stdout.write('Creating users...')
        
        # Admin user
        admin_user, created = User.objects.get_or_create(
            email='admin@spendsense.io',
            defaults={
                'full_name': 'System Admin',
                'role': 'admin',
                'is_active': True,
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if created:
            admin_user.set_password('AdminPass123!')
            admin_user.save()
            self.stdout.write(f'  ✓ Created admin user: {admin_user.email}')
        else:
            self.stdout.write(f'  - Admin user already exists: {admin_user.email}')
        
        # Test users for submissions
        test_users = []
        for i in range(3):
            user, created = User.objects.get_or_create(
                email=f'user{i+1}@spendsense.io',
                defaults={
                    'full_name': f'Test User {i+1}',
                    'role': 'user',
                    'city': ['Addis Ababa', 'Bishoftu', 'Adama'][i % 3],
                    'is_active': True,
                }
            )
            if created:
                user.set_password('Password123!')
                user.save()
            test_users.append(user)
        
        self.stdout.write(f'  ✓ Created {len(test_users)} test users')
        return admin_user
    
    def _ensure_items_exist(self):
        """Use existing CSA items from database."""
        self.stdout.write('Selecting CSA items for SARIMA training...')
        
        # Map to actual items in database (case-sensitive)
        key_item_names = [
            'Teff (White)',          # ID 1
            'Wheat Grain',           # ID 4
            'Rice (Basmati)',        # ID 10
            'Onions (Red)',          # ID 28
            'Tomatoes',              # ID 30
            'Potatoes',              # ID 31
            'Coffee (Green)',        # ID 78
            'Sugar (White)',         # ID 70
            'Milk (Fresh)',          # ID 50
            'Bread (Injera)',        # ID 82
        ]
        
        items = Item.objects.filter(name__in=key_item_names)
        if items.count() < len(key_item_names):
            self.stdout.write(f'  ⚠ Found {items.count()}/{len(key_item_names)} items')
        
        self.stdout.write(f'  ✓ Using {items.count()} items for training')
        return items
    
    def _create_price_history(self, admin_user, items):
        """Create realistic 90-day price history for each item."""
        self.stdout.write('Creating price history (90 days)...')
        
        test_users = list(User.objects.filter(role='user')[:3])
        if not test_users:
            test_users = [admin_user]
        
        cities = ['Addis Ababa', 'Bishoftu', 'Adama']
        days_of_history = 90
        total_created = 0
        
        # Base prices for realistic data
        base_prices = {
            'Teff (White)': 150.0,
            'Wheat Grain': 80.0,
            'Rice (Basmati)': 95.0,
            'Onions (Red)': 45.0,
            'Tomatoes': 55.0,
            'Potatoes': 40.0,
            'Coffee (Green)': 450.0,
            'Sugar (White)': 95.0,
            'Milk (Fresh)': 60.0,
            'Bread (Injera)': 5.0,
        }
        
        with transaction.atomic():
            for item in items:
                # Delete old submissions to avoid duplicates
                PriceSubmission.objects.filter(item=item).delete()
                
                base_price = base_prices.get(item.name, 100.0)
                
                # Create price submissions with realistic patterns
                for day_offset in range(days_of_history):
                    observed_date = date.today() - timedelta(days=day_offset)
                    
                    # Add trend (slight upward) and seasonality
                    trend = (days_of_history - day_offset) * 0.05  # 0.05 ETB per day
                    # Weekly seasonality (prices higher on weekends)
                    day_of_week = observed_date.weekday()
                    weekday_factor = 1.02 if day_of_week >= 4 else 1.0  # Higher on weekends
                    noise = random.uniform(-2, 2)
                    
                    final_price = base_price + trend + noise
                    final_price = final_price * weekday_factor
                    final_price = Decimal(final_price).quantize(Decimal('0.01'))
                    
                    # Create submissions from different users and cities
                    for city in cities:
                        user = random.choice(test_users)
                        PriceSubmission.objects.create(
                            user=user,
                            item=item,
                            price_value=final_price + Decimal(random.uniform(-3, 3)).quantize(Decimal('0.01')),
                            market_location='Sample Market' if random.random() > 0.5 else 'Central Market',
                            city=city,
                            date_observed=observed_date,
                            status='approved'
                        )
                        total_created += 1
        
        self.stdout.write(f'  ✓ Created {total_created} price submissions')
        return total_created
