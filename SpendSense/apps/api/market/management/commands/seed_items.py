"""
Create initial tracked items for the market (Week 1 seed).
Run: python manage.py seed_items
"""
from django.core.management.base import BaseCommand

from market.models import Item


DEFAULT_ITEMS = [
    {'name': 'Teff', 'category': 'Food', 'unit': 'kg'},
    {'name': 'Wheat Flour', 'category': 'Food', 'unit': 'kg'},
    {'name': 'Cooking Oil', 'category': 'Food', 'unit': 'litre'},
    {'name': 'Rice', 'category': 'Food', 'unit': 'kg'},
    {'name': 'Sugar', 'category': 'Food', 'unit': 'kg'},
    {'name': 'Onion', 'category': 'Food', 'unit': 'kg'},
    {'name': 'Tomato', 'category': 'Food', 'unit': 'kg'},
    {'name': 'Potato', 'category': 'Food', 'unit': 'kg'},
    {'name': 'Lentils', 'category': 'Food', 'unit': 'kg'},
    {'name': 'Bread', 'category': 'Food', 'unit': 'piece'},
    {'name': 'Fuel (Benzene)', 'category': 'Transport', 'unit': 'litre'},
    {'name': 'Fuel (Diesel)', 'category': 'Transport', 'unit': 'litre'},
    {'name': 'Minibus (short)', 'category': 'Transport', 'unit': 'trip'},
    {'name': 'Electricity', 'category': 'Utilities', 'unit': 'kWh'},
    {'name': 'Water', 'category': 'Utilities', 'unit': 'm³'},
]


class Command(BaseCommand):
    help = 'Create initial market items if they do not exist.'

    def handle(self, *args, **options):
        created = 0
        for data in DEFAULT_ITEMS:
            _, was_created = Item.objects.get_or_create(
                name=data['name'],
                defaults={'category': data['category'], 'unit': data['unit']},
            )
            if was_created:
                created += 1
        self.stdout.write(self.style.SUCCESS(f'Created {created} new items. Total items: {Item.objects.count()}'))
