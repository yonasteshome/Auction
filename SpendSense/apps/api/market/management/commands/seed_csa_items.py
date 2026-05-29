from django.core.management.base import BaseCommand
from market.models import Item

CSA_ALIGNED_ITEMS = [
    # Cereals & Grains
    {'name': 'Teff', 'category': 'Cereals & Grains', 'unit': 'kg'},
    {'name': 'Wheat grain', 'category': 'Cereals & Grains', 'unit': 'kg'},
    {'name': 'Maize grain', 'category': 'Cereals & Grains', 'unit': 'kg'},
    {'name': 'Barley', 'category': 'Cereals & Grains', 'unit': 'kg'},
    {'name': 'Sorghum', 'category': 'Cereals & Grains', 'unit': 'kg'},
    {'name': 'Rice', 'category': 'Cereals & Grains', 'unit': 'kg'},
    {'name': 'Oats', 'category': 'Cereals & Grains', 'unit': 'kg'},
    {'name': 'Pasta / Macaroni', 'category': 'Cereals & Grains', 'unit': 'packet'},
    {'name': 'Injera', 'category': 'Cereals & Grains', 'unit': 'piece'},
    {'name': 'White bread', 'category': 'Cereals & Grains', 'unit': 'loaf'},
    {'name': 'Biscuits (basic)', 'category': 'Cereals & Grains', 'unit': 'packet'},
    
    # Pulses & Legumes
    {'name': 'Lentils (Misir)', 'category': 'Pulses & Legumes', 'unit': 'kg'},
    {'name': 'Chickpeas (Shimbra)', 'category': 'Pulses & Legumes', 'unit': 'kg'},
    {'name': 'Split peas', 'category': 'Pulses & Legumes', 'unit': 'kg'},
    {'name': 'Haricot beans', 'category': 'Pulses & Legumes', 'unit': 'kg'},
    {'name': 'Fava beans (Baqela)', 'category': 'Pulses & Legumes', 'unit': 'kg'},
    {'name': 'Soybeans', 'category': 'Pulses & Legumes', 'unit': 'kg'},

    # Vegetables & Tubers
    {'name': 'Onion', 'category': 'Vegetables & Tubers', 'unit': 'kg'},
    {'name': 'Tomato', 'category': 'Vegetables & Tubers', 'unit': 'kg'},
    {'name': 'Potato', 'category': 'Vegetables & Tubers', 'unit': 'kg'},
    {'name': 'Sweet potato', 'category': 'Vegetables & Tubers', 'unit': 'kg'},
    {'name': 'Cabbage', 'category': 'Vegetables & Tubers', 'unit': 'piece'},
    {'name': 'Carrot', 'category': 'Vegetables & Tubers', 'unit': 'kg'},
    {'name': 'Beetroot', 'category': 'Vegetables & Tubers', 'unit': 'kg'},
    {'name': 'Green pepper', 'category': 'Vegetables & Tubers', 'unit': 'kg'},
    {'name': 'Chili pepper', 'category': 'Vegetables & Tubers', 'unit': 'kg'},
    {'name': 'Garlic', 'category': 'Vegetables & Tubers', 'unit': 'kg'},
    {'name': 'Ginger', 'category': 'Vegetables & Tubers', 'unit': 'kg'},
    {'name': 'Kale / Gomen', 'category': 'Vegetables & Tubers', 'unit': 'bunch'},
    {'name': 'Pumpkin', 'category': 'Vegetables & Tubers', 'unit': 'piece'},

    # Fruits
    {'name': 'Banana', 'category': 'Fruits', 'unit': 'kg'},
    {'name': 'Orange', 'category': 'Fruits', 'unit': 'kg'},
    {'name': 'Mango', 'category': 'Fruits', 'unit': 'kg'},
    {'name': 'Apple', 'category': 'Fruits', 'unit': 'kg'},
    {'name': 'Avocado', 'category': 'Fruits', 'unit': 'piece'},
    {'name': 'Papaya', 'category': 'Fruits', 'unit': 'piece'},
    {'name': 'Lemon', 'category': 'Fruits', 'unit': 'piece'},
    {'name': 'Watermelon', 'category': 'Fruits', 'unit': 'piece'},

    # Oils & Fats
    {'name': 'Palm oil', 'category': 'Oils & Fats', 'unit': 'liter'},
    {'name': 'Sunflower oil', 'category': 'Oils & Fats', 'unit': 'liter'},
    {'name': 'Nug (niger seed) oil', 'category': 'Oils & Fats', 'unit': 'liter'},
    {'name': 'Sesame oil', 'category': 'Oils & Fats', 'unit': 'liter'},
    {'name': 'Butter', 'category': 'Oils & Fats', 'unit': 'kg'},
    {'name': 'Margarine', 'category': 'Oils & Fats', 'unit': 'kg'},

    # Animal Products
    {'name': 'Fresh milk', 'category': 'Animal Products', 'unit': 'liter'},
    {'name': 'Powdered milk', 'category': 'Animal Products', 'unit': 'packet'},
    {'name': 'Eggs', 'category': 'Animal Products', 'unit': 'dozen'},
    {'name': 'Beef', 'category': 'Animal Products', 'unit': 'kg'},
    {'name': 'Mutton', 'category': 'Animal Products', 'unit': 'kg'},
    {'name': 'Goat meat', 'category': 'Animal Products', 'unit': 'kg'},
    {'name': 'Chicken meat', 'category': 'Animal Products', 'unit': 'kg'},
    {'name': 'Fish (local)', 'category': 'Animal Products', 'unit': 'kg'},

    # Sugar, Coffee & Spices
    {'name': 'Sugar', 'category': 'Sugar, Coffee & Spices', 'unit': 'kg'},
    {'name': 'Salt', 'category': 'Sugar, Coffee & Spices', 'unit': 'kg'},
    {'name': 'Coffee (raw)', 'category': 'Sugar, Coffee & Spices', 'unit': 'kg'},
    {'name': 'Coffee (roasted)', 'category': 'Sugar, Coffee & Spices', 'unit': 'kg'},
    {'name': 'Tea leaves', 'category': 'Sugar, Coffee & Spices', 'unit': 'packet'},
    {'name': 'Berbere', 'category': 'Sugar, Coffee & Spices', 'unit': 'kg'},
    {'name': 'Mitmita', 'category': 'Sugar, Coffee & Spices', 'unit': 'kg'},
    {'name': 'Turmeric', 'category': 'Sugar, Coffee & Spices', 'unit': 'kg'},

    # Cleaning & Hygiene
    {'name': 'Laundry soap', 'category': 'Cleaning & Hygiene', 'unit': 'piece'},
    {'name': 'Detergent powder', 'category': 'Cleaning & Hygiene', 'unit': 'kg'},
    {'name': 'Liquid detergent', 'category': 'Cleaning & Hygiene', 'unit': 'liter'},
    {'name': 'Dishwashing soap', 'category': 'Cleaning & Hygiene', 'unit': 'piece'},
    {'name': 'Toilet paper', 'category': 'Cleaning & Hygiene', 'unit': 'roll'},
    {'name': 'Toothpaste', 'category': 'Cleaning & Hygiene', 'unit': 'tube'},
    {'name': 'Bath soap', 'category': 'Cleaning & Hygiene', 'unit': 'piece'},
    {'name': 'Sanitary pads', 'category': 'Cleaning & Hygiene', 'unit': 'packet'},

    # Energy & Cooking Fuel
    {'name': 'Charcoal', 'category': 'Energy & Cooking Fuel', 'unit': 'sack'},
    {'name': 'Firewood', 'category': 'Energy & Cooking Fuel', 'unit': 'bundle'},
    {'name': 'Kerosene', 'category': 'Energy & Cooking Fuel', 'unit': 'liter'},
    {'name': 'LPG gas', 'category': 'Energy & Cooking Fuel', 'unit': 'cylinder'},
    {'name': 'Matches', 'category': 'Energy & Cooking Fuel', 'unit': 'box'},

    # Transportation
    {'name': 'Petrol', 'category': 'Transportation', 'unit': 'liter'},
    {'name': 'Diesel', 'category': 'Transportation', 'unit': 'liter'},
    {'name': 'City bus fare', 'category': 'Transportation', 'unit': 'trip'},
    {'name': 'Minibus taxi fare', 'category': 'Transportation', 'unit': 'trip'},
    {'name': 'Bajaj fare', 'category': 'Transportation', 'unit': 'trip'},
    {'name': 'Motorcycle taxi fare', 'category': 'Transportation', 'unit': 'trip'},

    # Utilities
    {'name': 'Electricity', 'category': 'Utilities', 'unit': 'kWh'},
    {'name': 'Water', 'category': 'Utilities', 'unit': 'cubic meter'},
    {'name': 'Waste collection fee', 'category': 'Utilities', 'unit': 'monthly'},

    # Communication
    {'name': 'Mobile airtime', 'category': 'Communication', 'unit': 'ETB value'},
    {'name': 'Mobile data', 'category': 'Communication', 'unit': 'GB'},
    {'name': 'Internet subscription', 'category': 'Communication', 'unit': 'monthly'},
]

class Command(BaseCommand):
    help = 'Seed market with CSA-aligned essential household items'

    def handle(self, *args, **options):
        # We delete existing items to reset the IDs and ensure the sequence matches
        # This resolves the IntegrityError (duplicate pkey) between seeders
        Item.objects.all().delete()
        
        created = 0
        updated = 0
        for data in CSA_ALIGNED_ITEMS:
            obj, was_created = Item.objects.update_or_create(
                name=data['name'],
                defaults={'category': data['category'], 'unit': data['unit']}
            )
            if was_created:
                created += 1
            else:
                updated += 1
                
        self.stdout.write(self.style.SUCCESS(f'Seed complete: {created} items created, {updated} items updated.'))
