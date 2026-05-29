import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core_api.settings')
django.setup()

from ecommerce.models import Category, Product
from users.models import User, Vendor

DATA = {
    "Cereals & Grains": [("Teff", "kg"), ("Wheat grain", "kg"), ("Maize grain", "kg"), ("Barley", "kg"), ("Sorghum", "kg"), ("Rice", "kg"), ("Oats", "kg"), ("Pasta / Macaroni", "packet"), ("Injera", "piece"), ("White bread", "loaf"), ("Biscuits (basic)", "packet")],
    "Pulses & Legumes": [("Lentils (Misir)", "kg"), ("Chickpeas (Shimbra)", "kg"), ("Split peas", "kg"), ("Haricot beans", "kg"), ("Fava beans (Baqela)", "kg"), ("Soybeans", "kg")],
    "Vegetables & Tubers": [("Onion", "kg"), ("Tomato", "kg"), ("Potato", "kg"), ("Sweet potato", "kg"), ("Cabbage", "piece"), ("Carrot", "kg"), ("Beetroot", "kg"), ("Green pepper", "kg"), ("Chili pepper", "kg"), ("Garlic", "kg"), ("Ginger", "kg"), ("Kale / Gomen", "bunch"), ("Pumpkin", "piece")],
    "Fruits": [("Banana", "kg"), ("Orange", "kg"), ("Mango", "kg"), ("Apple", "kg"), ("Avocado", "piece"), ("Papaya", "piece"), ("Lemon", "piece"), ("Watermelon", "piece")],
    "Oils & Fats": [("Palm oil", "liter"), ("Sunflower oil", "liter"), ("Nug (niger seed) oil", "liter"), ("Sesame oil", "liter"), ("Butter", "kg"), ("Margarine", "kg")],
    "Animal Products": [("Fresh milk", "liter"), ("Powdered milk", "packet"), ("Eggs", "dozen"), ("Beef", "kg"), ("Mutton", "kg"), ("Goat meat", "kg"), ("Chicken meat", "kg"), ("Fish (local)", "kg")],
    "Sugar, Coffee & Spices": [("Sugar", "kg"), ("Salt", "kg"), ("Coffee (raw)", "kg"), ("Coffee (roasted)", "kg"), ("Tea leaves", "packet"), ("Berbere", "kg"), ("Mitmita", "kg"), ("Turmeric", "kg")],
    "Cleaning & Hygiene": [("Laundry soap", "piece"), ("Detergent powder", "kg"), ("Liquid detergent", "liter"), ("Dishwashing soap", "piece"), ("Toilet paper", "roll"), ("Toothpaste", "tube"), ("Bath soap", "piece"), ("Sanitary pads", "packet")],
    "Energy & Cooking Fuel": [("Charcoal", "sack"), ("Firewood", "bundle"), ("Kerosene", "liter"), ("LPG gas", "cylinder"), ("Matches", "box")],
    "Basic Household Supplies": [("Plastic bucket", "piece"), ("Water container (jerrycan)", "piece"), ("Cooking oil container", "piece"), ("Cooking pot (basic)", "piece"), ("Frying pan", "piece")],
    "Transportation": [("Petrol", "liter"), ("Diesel", "liter"), ("City bus fare", "trip"), ("Minibus taxi fare", "trip"), ("Bajaj fare", "trip"), ("Motorcycle taxi fare", "trip")],
    "Utilities": [("Electricity", "kWh"), ("Water", "cubic meter"), ("Waste collection fee", "monthly")],
    "Communication": [("Mobile airtime", "ETB value"), ("Mobile data", "GB"), ("Internet subscription", "monthly")],
    "Health & Basic Services": [("Public clinic consultation", "visit"), ("Basic medicine (generic)", "unit"), ("Face mask", "piece")]
}

demo_admin = User.objects.filter(role='admin').first()
if not demo_admin:
    demo_admin = User.objects.create(email='admin_csa@spendsense.local', full_name='Admin', role='admin')
    demo_admin.set_password('DevPass123!')
    demo_admin.save()

vendor = Vendor.objects.first()
if not vendor:
    vendor = Vendor.objects.create(shop_name="Default Global Vendor", owner=demo_admin, city="Addis Ababa")

print("Seeding CSA Categories and Products...")

for cat_name, items in DATA.items():
    category, created = Category.objects.get_or_create(name=cat_name)
    if created:
        print(f"Created category: {cat_name}")

    for prod_name, unit in items:
        product, p_created = Product.objects.get_or_create(
            name=prod_name,
            category=category,
            defaults={
                'price': 0.00,
                'vendor': vendor,
                'description': f"Standard Unit: {unit}"
            }
        )
        if p_created:
            print(f"  Created product: {prod_name} ({unit})")

print("Done CSA Seeding.")
