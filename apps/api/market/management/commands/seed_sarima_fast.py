"""
Fast seed file for SARIMA model testing using bulk_create.
Run: python manage.py seed_sarima_fast
"""
import random
from datetime import date, timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand

from market.models import Item, PriceSubmission
from users.models import User


class Command(BaseCommand):
    help = 'Fast seed for SARIMA model using bulk_create'

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_LABEL('=== SARIMA Fast Seed ==='))
        
        # Ensure users exist
        self._ensure_users()
        
        # Get items
        items = self._get_items()
        
        # Create price history
        self._create_price_history_fast(items)
        
        # Summary
        submission_count = PriceSubmission.objects.count()
        self.stdout.write(self.style.SUCCESS(
            f'\n✓ Seed Complete!\n'
            f'  - Items: {items.count()}\n'
            f'  - Total Price Submissions: {submission_count}\n'
            f'\nYou can now train the SARIMA model!'
        ))
    
    def _ensure_users(self):
        """Ensure admin and test users exist."""
        self.stdout.write('Ensuring users exist...')
        
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
        
        # Test users
        for i in range(3):
            User.objects.get_or_create(
                email=f'user{i+1}@spendsense.io',
                defaults={
                    'full_name': f'Test User {i+1}',
                    'role': 'user',
                    'city': ['Addis Ababa', 'Bishoftu', 'Adama'][i % 3],
                    'is_active': True,
                }
            )
        
        self.stdout.write('  ✓ Users ready')
    
    def _get_items(self):
        """Get CSA items for SARIMA training."""
        self.stdout.write('Selecting CSA items for SARIMA training...')
        
        key_item_names = [
            'Teff (White)',
            'Wheat Grain',
            'Rice (Basmati)',
            'Onions (Red)',
            'Tomatoes',
            'Potatoes',
            'Coffee (Green)',
            'Sugar (White)',
            'Milk (Fresh)',
            'Bread (Injera)',
        ]
        
        items = Item.objects.filter(name__in=key_item_names)
        self.stdout.write(f'  ✓ Using {items.count()} items for training')
        return items
    
    def _create_price_history_fast(self, items):
        """Create realistic 60-day price history using bulk_create."""
        self.stdout.write('Creating price history (60 days) with bulk_create...')
        
        test_users = list(User.objects.filter(role='user')[:3])
        cities = ['Addis Ababa', 'Bishoftu', 'Adama']
        days_of_history = 60
        
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
        
        total_created = 0
        
        for item in items:
            self.stdout.write(f'  Creating history for {item.name}...')
            
            # Delete old submissions for this item
            PriceSubmission.objects.filter(item=item).delete()
            
            base_price = base_prices.get(item.name, 100.0)
            submissions = []
            
            # Generate all submissions for this item
            for day_offset in range(days_of_history):
                observed_date = date.today() - timedelta(days=day_offset)
                
                # Add trend and seasonality
                trend = (days_of_history - day_offset) * 0.05
                day_of_week = observed_date.weekday()
                weekday_factor = 1.02 if day_of_week >= 4 else 1.0
                noise = random.uniform(-2, 2)
                
                final_price = base_price + trend + noise
                final_price = final_price * weekday_factor
                final_price = Decimal(final_price).quantize(Decimal('0.01'))
                
                # Create submissions from different cities
                for city in cities:
                    user = random.choice(test_users)
                    submissions.append(
                        PriceSubmission(
                            user=user,
                            item=item,
                            price_value=final_price + Decimal(random.uniform(-3, 3)).quantize(Decimal('0.01')),
                            market_location='Sample Market' if random.random() > 0.5 else 'Central Market',
                            city=city,
                            date_observed=observed_date,
                            status='approved'
                        )
                    )
            
            # Bulk create all submissions for this item
            if submissions:
                PriceSubmission.objects.bulk_create(submissions, batch_size=500)
                self.stdout.write(f'    ✓ Created {len(submissions)} submissions')
                total_created += len(submissions)
        
        self.stdout.write(f'  ✓ Total created: {total_created} price submissions')
        return total_created
