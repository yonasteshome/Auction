"""Static product catalogue used by finance endpoints when requested.

This is a comprehensive list derived from product-category-table.md (CSA-Aligned Essential Household Items).
"""

PRODUCTS = [
    # A. Food and Non-Alcoholic Beverages
    # Cereals & Grains
    {"item_id": 1, "item_name": "Teff", "unit": "kg", "category": "Cereals & Grains", "image_url": "https://api.spendsense.app/static/products/teff.jpg"},
    {"item_id": 2, "item_name": "Wheat grain", "unit": "kg", "category": "Cereals & Grains", "image_url": "https://api.spendsense.app/static/products/wheat.jpg"},
    {"item_id": 3, "item_name": "Maize grain", "unit": "kg", "category": "Cereals & Grains", "image_url": "https://api.spendsense.app/static/products/maize.jpg"},
    {"item_id": 4, "item_name": "Barley", "unit": "kg", "category": "Cereals & Grains", "image_url": "https://api.spendsense.app/static/products/barley.jpg"},
    {"item_id": 5, "item_name": "Sorghum", "unit": "kg", "category": "Cereals & Grains", "image_url": "https://api.spendsense.app/static/products/sorghum.jpg"},
    {"item_id": 6, "item_name": "Rice", "unit": "kg", "category": "Cereals & Grains", "image_url": "https://api.spendsense.app/static/products/rice.jpg"},
    {"item_id": 7, "item_name": "Oats", "unit": "kg", "category": "Cereals & Grains", "image_url": "https://api.spendsense.app/static/products/oats.jpg"},
    {"item_id": 8, "item_name": "Pasta / Macaroni", "unit": "packet", "category": "Cereals & Grains", "image_url": "https://api.spendsense.app/static/products/pasta.jpg"},
    {"item_id": 9, "item_name": "Injera", "unit": "piece", "category": "Cereals & Grains", "image_url": "https://api.spendsense.app/static/products/injera.jpg"},
    {"item_id": 10, "item_name": "White bread", "unit": "loaf", "category": "Cereals & Grains", "image_url": "https://api.spendsense.app/static/products/bread.jpg"},
    {"item_id": 11, "item_name": "Biscuits (basic)", "unit": "packet", "category": "Cereals & Grains", "image_url": "https://api.spendsense.app/static/products/biscuits.jpg"},

    # Pulses & Legumes
    {"item_id": 12, "item_name": "Lentils (Misir)", "unit": "kg", "category": "Pulses & Legumes", "image_url": "https://api.spendsense.app/static/products/lentils.jpg"},
    {"item_id": 13, "item_name": "Chickpeas (Shimbra)", "unit": "kg", "category": "Pulses & Legumes", "image_url": "https://api.spendsense.app/static/products/chickpeas.jpg"},
    {"item_id": 14, "item_name": "Split peas", "unit": "kg", "category": "Pulses & Legumes", "image_url": "https://api.spendsense.app/static/products/split-peas.jpg"},
    {"item_id": 15, "item_name": "Haricot beans", "unit": "kg", "category": "Pulses & Legumes", "image_url": "https://api.spendsense.app/static/products/haricot-beans.jpg"},
    {"item_id": 16, "item_name": "Fava beans (Baqela)", "unit": "kg", "category": "Pulses & Legumes", "image_url": "https://api.spendsense.app/static/products/fava-beans.jpg"},
    {"item_id": 17, "item_name": "Soybeans", "unit": "kg", "category": "Pulses & Legumes", "image_url": "https://api.spendsense.app/static/products/soybeans.jpg"},

    # Vegetables & Tubers
    {"item_id": 18, "item_name": "Onion", "unit": "kg", "category": "Vegetables & Tubers", "image_url": "https://api.spendsense.app/static/products/onion.jpg"},
    {"item_id": 19, "item_name": "Tomato", "unit": "kg", "category": "Vegetables & Tubers", "image_url": "https://api.spendsense.app/static/products/tomato.jpg"},
    {"item_id": 20, "item_name": "Potato", "unit": "kg", "category": "Vegetables & Tubers", "image_url": "https://api.spendsense.app/static/products/potato.jpg"},
    {"item_id": 21, "item_name": "Sweet potato", "unit": "kg", "category": "Vegetables & Tubers", "image_url": "https://api.spendsense.app/static/products/sweet-potato.jpg"},
    {"item_id": 22, "item_name": "Cabbage", "unit": "piece", "category": "Vegetables & Tubers", "image_url": "https://api.spendsense.app/static/products/cabbage.jpg"},
    {"item_id": 23, "item_name": "Carrot", "unit": "kg", "category": "Vegetables & Tubers", "image_url": "https://api.spendsense.app/static/products/carrot.jpg"},
    {"item_id": 24, "item_name": "Beetroot", "unit": "kg", "category": "Vegetables & Tubers", "image_url": "https://api.spendsense.app/static/products/beetroot.jpg"},
    {"item_id": 25, "item_name": "Green pepper", "unit": "kg", "category": "Vegetables & Tubers", "image_url": "https://api.spendsense.app/static/products/green-pepper.jpg"},
    {"item_id": 26, "item_name": "Chili pepper", "unit": "kg", "category": "Vegetables & Tubers", "image_url": "https://api.spendsense.app/static/products/chili.jpg"},
    {"item_id": 27, "item_name": "Garlic", "unit": "kg", "category": "Vegetables & Tubers", "image_url": "https://api.spendsense.app/static/products/garlic.jpg"},
    {"item_id": 28, "item_name": "Ginger", "unit": "kg", "category": "Vegetables & Tubers", "image_url": "https://api.spendsense.app/static/products/ginger.jpg"},
    {"item_id": 29, "item_name": "Kale / Gomen", "unit": "bunch", "category": "Vegetables & Tubers", "image_url": "https://api.spendsense.app/static/products/kale.jpg"},
    {"item_id": 30, "item_name": "Pumpkin", "unit": "piece", "category": "Vegetables & Tubers", "image_url": "https://api.spendsense.app/static/products/pumpkin.jpg"},

    # Fruits
    {"item_id": 31, "item_name": "Banana", "unit": "kg", "category": "Fruits", "image_url": "https://api.spendsense.app/static/products/banana.jpg"},
    {"item_id": 32, "item_name": "Orange", "unit": "kg", "category": "Fruits", "image_url": "https://api.spendsense.app/static/products/orange.jpg"},
    {"item_id": 33, "item_name": "Mango", "unit": "kg", "category": "Fruits", "image_url": "https://api.spendsense.app/static/products/mango.jpg"},
    {"item_id": 34, "item_name": "Apple", "unit": "kg", "category": "Fruits", "image_url": "https://api.spendsense.app/static/products/apple.jpg"},
    {"item_id": 35, "item_name": "Avocado", "unit": "piece", "category": "Fruits", "image_url": "https://api.spendsense.app/static/products/avocado.jpg"},
    {"item_id": 36, "item_name": "Papaya", "unit": "piece", "category": "Fruits", "image_url": "https://api.spendsense.app/static/products/papaya.jpg"},
    {"item_id": 37, "item_name": "Lemon", "unit": "piece", "category": "Fruits", "image_url": "https://api.spendsense.app/static/products/lemon.jpg"},
    {"item_id": 38, "item_name": "Watermelon", "unit": "piece", "category": "Fruits", "image_url": "https://api.spendsense.app/static/products/watermelon.jpg"},

    # Oils & Fats
    {"item_id": 39, "item_name": "Palm oil", "unit": "liter", "category": "Oils & Fats", "image_url": "https://api.spendsense.app/static/products/palm-oil.jpg"},
    {"item_id": 40, "item_name": "Sunflower oil", "unit": "liter", "category": "Oils & Fats", "image_url": "https://api.spendsense.app/static/products/sunflower-oil.jpg"},
    {"item_id": 41, "item_name": "Nug (niger seed) oil", "unit": "liter", "category": "Oils & Fats", "image_url": "https://api.spendsense.app/static/products/nug-oil.jpg"},
    {"item_id": 42, "item_name": "Sesame oil", "unit": "liter", "category": "Oils & Fats", "image_url": "https://api.spendsense.app/static/products/sesame-oil.jpg"},
    {"item_id": 43, "item_name": "Butter", "unit": "kg", "category": "Oils & Fats", "image_url": "https://api.spendsense.app/static/products/butter.jpg"},
    {"item_id": 44, "item_name": "Margarine", "unit": "kg", "category": "Oils & Fats", "image_url": "https://api.spendsense.app/static/products/margarine.jpg"},

    # Animal Products
    {"item_id": 45, "item_name": "Fresh milk", "unit": "liter", "category": "Animal Products", "image_url": "https://api.spendsense.app/static/products/milk.jpg"},
    {"item_id": 46, "item_name": "Powdered milk", "unit": "packet", "category": "Animal Products", "image_url": "https://api.spendsense.app/static/products/powdered-milk.jpg"},
    {"item_id": 47, "item_name": "Eggs", "unit": "dozen", "category": "Animal Products", "image_url": "https://api.spendsense.app/static/products/eggs.jpg"},
    {"item_id": 48, "item_name": "Beef", "unit": "kg", "category": "Animal Products", "image_url": "https://api.spendsense.app/static/products/beef.jpg"},
    {"item_id": 49, "item_name": "Mutton", "unit": "kg", "category": "Animal Products", "image_url": "https://api.spendsense.app/static/products/mutton.jpg"},
    {"item_id": 50, "item_name": "Goat meat", "unit": "kg", "category": "Animal Products", "image_url": "https://api.spendsense.app/static/products/goat-meat.jpg"},
    {"item_id": 51, "item_name": "Chicken meat", "unit": "kg", "category": "Animal Products", "image_url": "https://api.spendsense.app/static/products/chicken.jpg"},
    {"item_id": 52, "item_name": "Fish (local)", "unit": "kg", "category": "Animal Products", "image_url": "https://api.spendsense.app/static/products/fish.jpg"},

    # Sugar, Coffee & Spices
    {"item_id": 53, "item_name": "Sugar", "unit": "kg", "category": "Sugar, Coffee & Spices", "image_url": "https://api.spendsense.app/static/products/sugar.jpg"},
    {"item_id": 54, "item_name": "Salt", "unit": "kg", "category": "Sugar, Coffee & Spices", "image_url": "https://api.spendsense.app/static/products/salt.jpg"},
    {"item_id": 55, "item_name": "Coffee (raw)", "unit": "kg", "category": "Sugar, Coffee & Spices", "image_url": "https://api.spendsense.app/static/products/raw-coffee.jpg"},
    {"item_id": 56, "item_name": "Coffee (roasted)", "unit": "kg", "category": "Sugar, Coffee & Spices", "image_url": "https://api.spendsense.app/static/products/roasted-coffee.jpg"},
    {"item_id": 57, "item_name": "Tea leaves", "unit": "packet", "category": "Sugar, Coffee & Spices", "image_url": "https://api.spendsense.app/static/products/tea.jpg"},
    {"item_id": 58, "item_name": "Berbere", "unit": "kg", "category": "Sugar, Coffee & Spices", "image_url": "https://api.spendsense.app/static/products/berbere.jpg"},
    {"item_id": 59, "item_name": "Mitmita", "unit": "kg", "category": "Sugar, Coffee & Spices", "image_url": "https://api.spendsense.app/static/products/mitmita.jpg"},
    {"item_id": 60, "item_name": "Turmeric", "unit": "kg", "category": "Sugar, Coffee & Spices", "image_url": "https://api.spendsense.app/static/products/turmeric.jpg"},

    # B. Household Non-Food Goods
    # Cleaning & Hygiene
    {"item_id": 61, "item_name": "Laundry soap", "unit": "piece", "category": "Cleaning & Hygiene", "image_url": "https://api.spendsense.app/static/products/laundry-soap.jpg"},
    {"item_id": 62, "item_name": "Detergent powder", "unit": "kg", "category": "Cleaning & Hygiene", "image_url": "https://api.spendsense.app/static/products/detergent.jpg"},
    {"item_id": 63, "item_name": "Liquid detergent", "unit": "liter", "category": "Cleaning & Hygiene", "image_url": "https://api.spendsense.app/static/products/liquid-detergent.jpg"},
    {"item_id": 64, "item_name": "Dishwashing soap", "unit": "piece", "category": "Cleaning & Hygiene", "image_url": "https://api.spendsense.app/static/products/dish-soap.jpg"},
    {"item_id": 65, "item_name": "Toilet paper", "unit": "roll", "category": "Cleaning & Hygiene", "image_url": "https://api.spendsense.app/static/products/toilet-paper.jpg"},
    {"item_id": 66, "item_name": "Toothpaste", "unit": "tube", "category": "Cleaning & Hygiene", "image_url": "https://api.spendsense.app/static/products/toothpaste.jpg"},
    {"item_id": 67, "item_name": "Bath soap", "unit": "piece", "category": "Cleaning & Hygiene", "image_url": "https://api.spendsense.app/static/products/bath-soap.jpg"},
    {"item_id": 68, "item_name": "Sanitary pads", "unit": "packet", "category": "Cleaning & Hygiene", "image_url": "https://api.spendsense.app/static/products/sanitary-pads.jpg"},

    # Energy & Cooking Fuel
    {"item_id": 69, "item_name": "Charcoal", "unit": "sack", "category": "Energy & Cooking Fuel", "image_url": "https://api.spendsense.app/static/products/charcoal.jpg"},
    {"item_id": 70, "item_name": "Firewood", "unit": "bundle", "category": "Energy & Cooking Fuel", "image_url": "https://api.spendsense.app/static/products/firewood.jpg"},
    {"item_id": 71, "item_name": "Kerosene", "unit": "liter", "category": "Energy & Cooking Fuel", "image_url": "https://api.spendsense.app/static/products/kerosene.jpg"},
    {"item_id": 72, "item_name": "LPG gas", "unit": "cylinder", "category": "Energy & Cooking Fuel", "image_url": "https://api.spendsense.app/static/products/lpg-gas.jpg"},
    {"item_id": 73, "item_name": "Matches", "unit": "box", "category": "Energy & Cooking Fuel", "image_url": "https://api.spendsense.app/static/products/matches.jpg"},

    # Basic Household Supplies
    {"item_id": 74, "item_name": "Plastic bucket", "unit": "piece", "category": "Basic Household Supplies", "image_url": "https://api.spendsense.app/static/products/bucket.jpg"},
    {"item_id": 75, "item_name": "Water container (jerrycan)", "unit": "piece", "category": "Basic Household Supplies", "image_url": "https://api.spendsense.app/static/products/jerrycan.jpg"},
    {"item_id": 76, "item_name": "Cooking oil container", "unit": "piece", "category": "Basic Household Supplies", "image_url": "https://api.spendsense.app/static/products/oil-container.jpg"},
    {"item_id": 77, "item_name": "Cooking pot (basic)", "unit": "piece", "category": "Basic Household Supplies", "image_url": "https://api.spendsense.app/static/products/pot.jpg"},
    {"item_id": 78, "item_name": "Frying pan", "unit": "piece", "category": "Basic Household Supplies", "image_url": "https://api.spendsense.app/static/products/pan.jpg"},

    # C. Transport, Utilities, and Essential Services
    # Transportation
    {"item_id": 79, "item_name": "Petrol", "unit": "liter", "category": "Transportation", "image_url": "https://api.spendsense.app/static/products/petrol.jpg"},
    {"item_id": 80, "item_name": "Diesel", "unit": "liter", "category": "Transportation", "image_url": "https://api.spendsense.app/static/products/diesel.jpg"},
    {"item_id": 81, "item_name": "City bus fare", "unit": "trip", "category": "Transportation", "image_url": "https://api.spendsense.app/static/products/bus.jpg"},
    {"item_id": 82, "item_name": "Minibus taxi fare", "unit": "trip", "category": "Transportation", "image_url": "https://api.spendsense.app/static/products/taxi.jpg"},
    {"item_id": 83, "item_name": "Bajaj fare", "unit": "trip", "category": "Transportation", "image_url": "https://api.spendsense.app/static/products/bajaj.jpg"},
    {"item_id": 84, "item_name": "Motorcycle taxi fare", "unit": "trip", "category": "Transportation", "image_url": "https://api.spendsense.app/static/products/motorcycle.jpg"},

    # Utilities
    {"item_id": 85, "item_name": "Electricity", "unit": "kWh", "category": "Utilities", "image_url": "https://api.spendsense.app/static/products/electricity.jpg"},
    {"item_id": 86, "item_name": "Water", "unit": "cubic meter", "category": "Utilities", "image_url": "https://api.spendsense.app/static/products/water.jpg"},
    {"item_id": 87, "item_name": "Waste collection fee", "unit": "monthly", "category": "Utilities", "image_url": "https://api.spendsense.app/static/products/waste.jpg"},

    # Communication
    {"item_id": 88, "item_name": "Mobile airtime", "unit": "ETB value", "category": "Communication", "image_url": "https://api.spendsense.app/static/products/airtime.jpg"},
    {"item_id": 89, "item_name": "Mobile data", "unit": "GB", "category": "Communication", "image_url": "https://api.spendsense.app/static/products/data.jpg"},
    {"item_id": 90, "item_name": "Internet subscription", "unit": "monthly", "category": "Communication", "image_url": "https://api.spendsense.app/static/products/internet.jpg"},

    # Health & Basic Services
    {"item_id": 91, "item_name": "Public clinic consultation", "unit": "visit", "category": "Health & Basic Services", "image_url": "https://api.spendsense.app/static/products/clinic.jpg"},
    {"item_id": 92, "item_name": "Basic medicine (generic)", "unit": "unit", "category": "Health & Basic Services", "image_url": "https://api.spendsense.app/static/products/medicine.jpg"},
    {"item_id": 93, "item_name": "Face mask", "unit": "piece", "category": "Health & Basic Services", "image_url": "https://api.spendsense.app/static/products/mask.jpg"},
]

CATEGORIES = [
    {"name": "Cereals & Grains", "image_url": "https://api.spendsense.app/static/categories/cereals.jpg"},
    {"name": "Pulses & Legumes", "image_url": "https://api.spendsense.app/static/categories/pulses.jpg"},
    {"name": "Vegetables & Tubers", "image_url": "https://api.spendsense.app/static/categories/vegetables.jpg"},
    {"name": "Fruits", "image_url": "https://api.spendsense.app/static/categories/fruits.jpg"},
    {"name": "Oils & Fats", "image_url": "https://api.spendsense.app/static/categories/oils.jpg"},
    {"name": "Animal Products", "image_url": "https://api.spendsense.app/static/categories/animal-products.jpg"},
    {"name": "Sugar, Coffee & Spices", "image_url": "https://api.spendsense.app/static/categories/spices.jpg"},
    {"name": "Cleaning & Hygiene", "image_url": "https://api.spendsense.app/static/categories/cleaning.jpg"},
    {"name": "Energy & Cooking Fuel", "image_url": "https://api.spendsense.app/static/categories/energy.jpg"},
    {"name": "Basic Household Supplies", "image_url": "https://api.spendsense.app/static/categories/supplies.jpg"},
    {"name": "Transportation", "image_url": "https://api.spendsense.app/static/categories/transport.jpg"},
    {"name": "Utilities", "image_url": "https://api.spendsense.app/static/categories/utilities.jpg"},
    {"name": "Communication", "image_url": "https://api.spendsense.app/static/categories/communication.jpg"},
    {"name": "Health & Basic Services", "image_url": "https://api.spendsense.app/static/categories/health.jpg"},
]
