// ============================================================
// SpendSense Ethiopia - Prisma Database Seeder
// Cost of Living Tracker, Budget Assistant & Smart Shopping Platform
// Generated: 2026-04-28
// Total Records: ~54,000+
// Run with: npx ts-node prisma/seed.ts
// ============================================================

// import { PrismaClient } from "../src/generated/prisma";
import { v4 as uuidv4 } from 'uuid';
import {prisma} from "../src/db"

// Helper functions
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min: number, max: number) => Math.round((Math.random() * (max - min) + min) * 100) / 100;
const randomChoice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Data configurations
const ETHIOPIAN_CITIES = [
  "Addis Ababa", "Dire Dawa", "Mekelle", "Gondar", "Bahir Dar", 
  "Hawassa", "Jimma", "Dessie", "Jijiga", "Shashamane",
  "Bishoftu", "Adama", "Harar", "Arba Minch", "Hosaena",
  "Debre Birhan", "Debre Markos", "Sodo", "Dilla", "Nekemte",
  "Axum", "Gambela", "Asosa", "Semera", "Wolaita Sodo",
  "Woldiya", "Kombolcha", "Debre Tabor", "Ambo", "Burayu"
];

const MARKET_ITEMS = [
  // GRAINS - Teff most expensive; wheat surged 28% due to currency crisis
  { name: "Teff (White)", category: "Grains", unit: "kg", priceRange: [110, 145] },
  { name: "Teff (Brown)", category: "Grains", unit: "kg", priceRange: [100, 135] },
  { name: "Teff (Mixed)", category: "Grains", unit: "kg", priceRange: [95, 125] },
  { name: "Wheat Grain", category: "Grains", unit: "kg", priceRange: [75, 95] },
  { name: "Wheat Flour", category: "Grains", unit: "kg", priceRange: [80, 105] },
  { name: "Barley", category: "Grains", unit: "kg", priceRange: [38, 50] },
  { name: "Maize", category: "Grains", unit: "kg", priceRange: [45, 58] },
  { name: "Sorghum", category: "Grains", unit: "kg", priceRange: [40, 52] },
  { name: "Oats", category: "Grains", unit: "kg", priceRange: [55, 75] },
  { name: "Rice (Basmati)", category: "Grains", unit: "kg", priceRange: [90, 130] },
  { name: "Rice (Local)", category: "Grains", unit: "kg", priceRange: [50, 70] },
  { name: "Millet", category: "Grains", unit: "kg", priceRange: [35, 48] },
  // PULSES
  { name: "Shiro (Chickpea Flour)", category: "Pulses", unit: "kg", priceRange: [65, 90] },
  { name: "Chickpeas", category: "Pulses", unit: "kg", priceRange: [55, 75] },
  { name: "Lentils (Red)", category: "Pulses", unit: "kg", priceRange: [50, 68] },
  { name: "Lentils (Green)", category: "Pulses", unit: "kg", priceRange: [45, 62] },
  { name: "Fava Beans (Ful)", category: "Pulses", unit: "kg", priceRange: [38, 52] },
  { name: "Peas (Split)", category: "Pulses", unit: "kg", priceRange: [42, 58] },
  { name: "Peas (Whole)", category: "Pulses", unit: "kg", priceRange: [38, 52] },
  { name: "Soybeans", category: "Pulses", unit: "kg", priceRange: [32, 45] },
  // OILS - Heavily imported; oils/fats inflation +12.4%; birr depreciated 107%
  { name: "Palm Oil", category: "Oils", unit: "liter", priceRange: [280, 380] },
  { name: "Sunflower Oil", category: "Oils", unit: "liter", priceRange: [250, 340] },
  { name: "Sesame Oil", category: "Oils", unit: "liter", priceRange: [200, 290] },
  { name: "Niger Seed Oil", category: "Oils", unit: "liter", priceRange: [220, 310] },
  { name: "Butter (Local)", category: "Oils", unit: "kg", priceRange: [450, 650] },
  { name: "Butter (Processed)", category: "Oils", unit: "kg", priceRange: [380, 550] },
  { name: "Ghee (Niter Kibbeh)", category: "Oils", unit: "kg", priceRange: [500, 750] },
  // VEGETABLES - Inflation +9.1%
  { name: "Onions (Red)", category: "Vegetables", unit: "kg", priceRange: [25, 45] },
  { name: "Onions (White)", category: "Vegetables", unit: "kg", priceRange: [22, 38] },
  { name: "Tomatoes", category: "Vegetables", unit: "kg", priceRange: [20, 40] },
  { name: "Potatoes", category: "Vegetables", unit: "kg", priceRange: [25, 42] },
  { name: "Carrots", category: "Vegetables", unit: "kg", priceRange: [20, 35] },
  { name: "Cabbage", category: "Vegetables", unit: "kg", priceRange: [15, 28] },
  { name: "Garlic", category: "Vegetables", unit: "kg", priceRange: [60, 95] },
  { name: "Green Peppers", category: "Vegetables", unit: "kg", priceRange: [25, 45] },
  { name: "Hot Peppers (Berbere)", category: "Vegetables", unit: "kg", priceRange: [45, 75] },
  { name: "Spinach", category: "Vegetables", unit: "bunch", priceRange: [8, 18] },
  { name: "Lettuce", category: "Vegetables", unit: "bunch", priceRange: [8, 15] },
  { name: "Beetroot", category: "Vegetables", unit: "kg", priceRange: [18, 32] },
  { name: "Cauliflower", category: "Vegetables", unit: "kg", priceRange: [25, 45] },
  // FRUITS
  { name: "Bananas", category: "Fruits", unit: "kg", priceRange: [20, 38] },
  { name: "Avocados", category: "Fruits", unit: "kg", priceRange: [15, 30] },
  { name: "Mangoes", category: "Fruits", unit: "kg", priceRange: [30, 60] },
  { name: "Papayas", category: "Fruits", unit: "kg", priceRange: [25, 45] },
  { name: "Oranges", category: "Fruits", unit: "kg", priceRange: [30, 55] },
  { name: "Lemons", category: "Fruits", unit: "kg", priceRange: [25, 45] },
  { name: "Pineapples", category: "Fruits", unit: "kg", priceRange: [35, 65] },
  { name: "Apples (Imported)", category: "Fruits", unit: "kg", priceRange: [120, 200] },
  { name: "Watermelons", category: "Fruits", unit: "kg", priceRange: [18, 35] },
  // DAIRY - Inflation +14.0%
  { name: "Milk (Fresh)", category: "Dairy", unit: "liter", priceRange: [55, 80] },
  { name: "Milk (Powdered)", category: "Dairy", unit: "kg", priceRange: [350, 550] },
  { name: "Eggs", category: "Dairy", unit: "dozen", priceRange: [160, 250] },
  { name: "Cheese (Local)", category: "Dairy", unit: "kg", priceRange: [350, 550] },
  { name: "Yogurt", category: "Dairy", unit: "liter", priceRange: [70, 110] },
  // MEAT - Inflation +14.7%
  { name: "Beef (Tibs Cut)", category: "Meat", unit: "kg", priceRange: [480, 680] },
  { name: "Beef (Mincing)", category: "Meat", unit: "kg", priceRange: [420, 600] },
  { name: "Goat Meat", category: "Meat", unit: "kg", priceRange: [450, 650] },
  { name: "Lamb Meat", category: "Meat", unit: "kg", priceRange: [520, 750] },
  { name: "Chicken (Whole)", category: "Meat", unit: "kg", priceRange: [280, 420] },
  { name: "Chicken (Breast)", category: "Meat", unit: "kg", priceRange: [350, 500] },
  { name: "Fish (Tilapia)", category: "Meat", unit: "kg", priceRange: [250, 380] },
  { name: "Fish (Nile Perch)", category: "Meat", unit: "kg", priceRange: [280, 420] },
  // SPICES
  { name: "Berbere (Spice Mix)", category: "Spices", unit: "kg", priceRange: [120, 200] },
  { name: "Mitmita", category: "Spices", unit: "kg", priceRange: [150, 250] },
  { name: "Turmeric", category: "Spices", unit: "kg", priceRange: [80, 120] },
  { name: "Cumin", category: "Spices", unit: "kg", priceRange: [70, 110] },
  { name: "Coriander", category: "Spices", unit: "kg", priceRange: [55, 90] },
  { name: "Black Pepper", category: "Spices", unit: "kg", priceRange: [180, 280] },
  { name: "Salt (Iodized)", category: "Spices", unit: "kg", priceRange: [15, 28] },
  { name: "Sugar (White)", category: "Spices", unit: "kg", priceRange: [65, 95] },
  { name: "Sugar (Brown)", category: "Spices", unit: "kg", priceRange: [55, 85] },
  { name: "Honey (White)", category: "Spices", unit: "kg", priceRange: [400, 650] },
  { name: "Honey (Red)", category: "Spices", unit: "kg", priceRange: [350, 580] },
  // FUEL - Volatile; transport costs +13.3%
  { name: "Charcoal", category: "Fuel", unit: "sack", priceRange: [600, 950] },
  { name: "Firewood", category: "Fuel", unit: "bundle", priceRange: [200, 380] },
  { name: "Kerosene", category: "Fuel", unit: "liter", priceRange: [70, 110] },
  { name: "Electricity (per kWh)", category: "Fuel", unit: "kWh", priceRange: [2.0, 3.5] },
  // BEVERAGES
  { name: "Coffee (Green)", category: "Beverages", unit: "kg", priceRange: [120, 200] },
  { name: "Coffee (Roasted)", category: "Beverages", unit: "kg", priceRange: [300, 480] },
  { name: "Tea (Black)", category: "Beverages", unit: "kg", priceRange: [200, 320] },
  { name: "Bottled Water", category: "Beverages", unit: "liter", priceRange: [20, 35] },
  // BAKERY - Inflation +3.5%
  { name: "Bread (Injera)", category: "Bakery", unit: "piece", priceRange: [8, 18] },
  { name: "Bread (Dabo)", category: "Bakery", unit: "piece", priceRange: [15, 30] },
  // HOUSEHOLD - Inflation +10.6%
  { name: "Soap (Laundry)", category: "Household", unit: "bar", priceRange: [35, 60] },
  { name: "Soap (Bath)", category: "Household", unit: "bar", priceRange: [25, 45] },
  { name: "Detergent", category: "Household", unit: "kg", priceRange: [55, 90] },
];

type MarketItemSeed = (typeof MARKET_ITEMS)[number] & { id: number };

const BUDGET_CATEGORIES = [
  "Food & Groceries", "Transportation", "Housing & Rent", "Utilities",
  "Healthcare", "Education", "Clothing", "Entertainment", 
  "Savings", "Debt Payments", "Communications", "Personal Care",
  "Household Items", "Religious & Cultural", "Gifts & Donations",
  "Emergency Fund", "Fuel & Energy", "Water & Sanitation"
];

const PAYMENT_METHODS = ["Cash", "CBE Birr", "Telebirr", "Amole", "HelloCash", "Bank Transfer", "Mobile Banking", "Credit Card"];
const EXPENSE_CATEGORIES = ["Food & Groceries", "Transportation", "Housing", "Utilities", "Healthcare", "Education", "Clothing", "Entertainment", "Fuel", "Communication", "Other"];
const ROLES = ["consumer", "vendor", "admin", "analyst"];
const INCOME_BRACKETS = ["Below 3,000 ETB", "3,000 - 5,000 ETB", "5,000 - 8,000 ETB", "8,000 - 15,000 ETB", "15,000 - 25,000 ETB", "25,000 - 50,000 ETB", "Above 50,000 ETB"];
const TX_STATUSES = ["completed", "pending", "failed", "refunded", "cancelled"];
const SUBMISSION_STATUSES = ["approved", "pending", "rejected", "flagged"];
const NOTIFICATION_TYPES = ["budget_alert", "price_spike", "price_drop", "vendor_nearby", "forecast_ready", "system", "transaction", "reminder"];
const AUDIT_ACTIONS = ["CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT", "VIEW", "EXPORT", "IMPORT"];
const AUDIT_RESOURCES = ["user", "vendor", "expense", "budget", "transaction", "price_submission", "forecast", "item", "notification", "system_setting"];
const ML_MODELS = ["SARIMA_v1", "SARIMA_v2", "Prophet_v1", "LSTM_v1", "XGBoost_v1", "ARIMA_v1"];

// Ethiopian names
const FIRST_NAMES = ["Abebe", "Kebede", "Hana", "Meron", "Dawit", "Selam", "Beti", "Tigist", "Solomon", "Genet", "Meseret", "Yonas", "Fatuma", "Amina", "Tesfaye", "W/ro", "Ato", "Deacon", "Sheikh", "Mohammed", "Ali", "Omar", "Hussein", "Ibrahim", "Yusuf", "Amanuel", "Daniel", "Michael", "Gabriel", "Raphael", "Samuel", "David", "Joseph", "Mary", "Martha", "Elizabeth", "Sarah", "Rebecca", "Ruth", "Esther", "Deborah", "Abel", "Cain", "Noah", "Moses", "Aaron", "Joshua", "Caleb", "Gideon", "Samson", "Tewodros", "Yohannes", "Menelik", "Haile", "Mengistu", "Meles", "Abiy", "Lemma", "Birtukan", "Aster", "Tsehay", "Zerihun", "Asfaw", "Bekele", "Bogale", "Demissie", "Ejigu", "Fekadu", "Girma", "Habte", "Kassa", "Lemma", "Mamo", "Negash", "Olana", "Petros", "Tadesse", "Wolde", "Yilma", "Zewde", "Abeba", "Alem", "Belay", "Desta", "Eskinder", "Fikre", "Gizaw", "Hailu", "Kifle", "Mekonnen", "Nigussie", "Reda", "Seifu", "Tilahun", "Wondimu", "Worku", "Yalew", "Zeleke", "Adane", "Bereket", "Chala", "Dereje", "Ermias", "Fikadu", "Getachew", "Hailu", "Jemal", "Kassahun", "Lema", "Mekuria", "Nuredin", "Oljira", "Tadesse", "Umer", "Wakgari", "Yadeta", "Zerihun"];
const LAST_NAMES = ["Bekele", "Tadesse", "Hailu", "Mengistu", "Alemu", "Girma", "Lemma", "Negash", "Demissie", "Wolde", "Yilma", "Zewde", "Abebe", "Kebede", "Hana", "Meron", "Dawit", "Selam", "Beti", "Tigist", "Solomon", "Genet", "Meseret", "Yonas", "Fatuma", "Amina", "Tesfaye", "Mohammed", "Ali", "Omar", "Hussein", "Ibrahim", "Amanuel", "Daniel", "Michael", "Gabriel", "Raphael", "Samuel", "David", "Joseph", "Bogale", "Ejigu", "Fekadu", "Habte", "Kassa", "Mamo", "Olana", "Petros", "Wondimu", "Worku", "Yalew", "Zeleke", "Adane", "Bereket", "Chala", "Dereje", "Ermias", "Fikadu", "Getachew", "Jemal", "Kassahun", "Lema", "Mekuria", "Nuredin", "Oljira", "Umer", "Wakgari", "Yadeta", "Asfaw", "Bekele", "Desta", "Eskinder", "Gizaw", "Kifle", "Mekonnen", "Nigussie", "Reda", "Seifu", "Tilahun", "Worku", "Abdi", "Ahmed", "Bashir", "Dirie", "Farah", "Gedi", "Hassan", "Ismail", "Jama", "Kadir", "Liban", "Mussa", "Nur", "Osman", "Qalib", "Rage", "Sadiq", "Tahi", "Ugas", "Warsame", "Xasan", "Yasin", "Zubeyr"];

const SHOP_PREFIXES = ["Abebe", "Kebede", "Hana", "Meron", "Dawit", "Selam", "Beti", "Tigist", "Solomon", "Genet", "Meseret", "Yonas", "Fatuma", "Amina", "Tesfaye", "W/ro", "Ato", "Deacon", "Sheikh"];
const SHOP_TYPES = ["Market", "Grocery", "Supermarket", "Wholesale", "Mini-Mart", "Shop", "Trading", "Enterprise", "Plc", "Store", "Bazaar", "Souq"];
const SHOP_SUFFIXES = ["Trading", "Enterprise", "General Trading", "Import & Export", "PLC", "Share Company", "Cooperative", "Union", "Group"];

function generatePhone(): string {
  const prefixes = ["0911", "0912", "0913", "0915", "0916", "0917", "0918", "0919", "0920", "0921", "0922", "0923", "0924", "0925", "0926", "0927", "0928", "0929", "0930", "0931", "0932", "0933", "0934", "0935", "0966", "0967", "0968", "0969", "0970", "0971", "0972", "0973", "0980", "0981", "0982", "0983", "0984", "0985"];
  return randomChoice(prefixes) + String(randomInt(100000, 999999));
}

function generateFullName(): string {
  const first = randomChoice(FIRST_NAMES);
  const last = randomChoice(LAST_NAMES);
  if (Math.random() < 0.3) {
    return `${first} ${randomChoice(FIRST_NAMES)} ${last}`;
  }
  return `${first} ${last}`;
}

function generateShopName(): string {
  const patterns = [
    `${randomChoice(SHOP_PREFIXES)} ${randomChoice(SHOP_TYPES)}`,
    `${randomChoice(SHOP_PREFIXES)} ${randomChoice(SHOP_TYPES)} ${randomChoice(SHOP_SUFFIXES)}`,
    `${randomChoice(SHOP_PREFIXES)} & ${randomChoice(SHOP_PREFIXES)} ${randomChoice(SHOP_TYPES)}`,
    `${randomChoice(SHOP_PREFIXES)} ${randomChoice(['Family', 'Brothers', 'Sisters', 'Sons'])} ${randomChoice(SHOP_TYPES)}`,
    `${randomChoice(SHOP_PREFIXES)} ${randomChoice(['General', 'Modern', 'New', 'Golden', 'Royal', 'Star', 'Unity', 'Hope', 'Bright'])} ${randomChoice(SHOP_TYPES)}`,
  ];
  return randomChoice(patterns);
}

function generateAddress(city: string): string {
  const subcities: Record<string, string[]> = {
    "Addis Ababa": ["Kirkos", "Arada", "Addis Ketema", "Lideta", "Yeka", "Bole", "Nifas Silk", "Kolfe", "Akaky Kaliti", "Gulele"],
    "Dire Dawa": ["Dire Dawa City", "Gurgura", "Sabu"],
    "Mekelle": ["Quiha", "Adi Haki", "Hadnet", "Hawelti", "Kedamay Weyane"],
    "Gondar": ["Azezo", "Maraki", "Dabat", "Dembiya"],
    "Bahir Dar": ["Felege Hiwot", "Tana", "Zegie", "Abay"],
    "Hawassa": ["Hawassa City", "Tulla", "Malga", "Boricha"],
    "Jimma": ["Jimma City", "Mana", "Seka Chekorsa", "Gomma"],
  };

  const subcity = subcities[city] ? randomChoice(subcities[city]) : `Kebele ${randomInt(1, 20)}`;
  const streetTypes = ["Street", "Road", "Avenue", "Boulevard", "Alley", "Lane"];
  const landmarks = ["Near", "Behind", "In front of", "Next to", "Close to"];

  const patterns = [
    `${subcity}, ${randomChoice(['Kebele', 'Woreda'])} ${randomInt(1, 20)}, House No. ${randomInt(1, 500)}`,
    `${subcity}, ${randomInt(1, 20)} ${randomChoice(streetTypes)}, Building ${randomInt(1, 100)}`,
    `${subcity}, ${randomChoice(landmarks)} ${randomChoice(['Market', 'Church', 'Mosque', 'School', 'Hospital', 'Bank'])}`,
    `${subcity}, ${randomChoice(['Main', 'Central', 'Commercial', 'Residential'])} ${randomChoice(streetTypes)}`,
  ];
  return randomChoice(patterns);
}

async function main() {
  const startTime = Date.now();
  console.log('🌱 Starting SpendSense Ethiopia database seeding...\n');

  // Clear existing data
  // console.log('🧹 Clearing existing data...');
  // await prisma.users_auditlog.deleteMany();
  // await prisma.users_notification.deleteMany();
  // await prisma.users_systemsetting.deleteMany();
  // await prisma.market_forecast.deleteMany();
  // await prisma.market_nationalprice.deleteMany();
  // await prisma.market_pricesubmission.deleteMany();
  // await prisma.market_vendorprice.deleteMany();
  // await prisma.ecommerce_transaction.deleteMany();
  // await prisma.finance_expense.deleteMany();
  // await prisma.finance_budgetcategory.deleteMany();
  // await prisma.finance_budget.deleteMany();
  // await prisma.users_vendor.deleteMany();
  // await prisma.market_item.deleteMany();
  // await prisma.users_user.deleteMany();
  // console.log('✅ Data cleared\n');

  const now = new Date();
  const startDate = new Date('2024-01-01');

  // ============================================================
  // 1. USERS (500)
  // ============================================================
  console.log('👥 Creating users...');
  const usersData = [];
  for (let i = 0; i < 500; i++) {
    const fullName = generateFullName();
    const firstName = fullName.split(' ')[0];
    const lastName = fullName.split(' ').pop() || firstName;
    const city = randomChoice(ETHIOPIAN_CITIES);
    const role = randomChoice(ROLES);

    usersData.push({
      id: uuidv4(),
      password: 'pbkdf2_sha256$600000$dummy$hash',
      last_login: Math.random() < 0.8 ? randomDate(startDate, now) : null,
      is_superuser: Math.random() < 0.02,
      full_name: fullName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomInt(1, 999)}@${randomChoice(['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'ethionet.et'])}`,
      phone: Math.random() < 0.85 ? generatePhone() : null,
      role: role,
      city: city,
      household_size: Math.random() < 0.9 ? randomInt(1, 8) : null,
      income_bracket: Math.random() < 0.8 ? randomChoice(INCOME_BRACKETS) : null,
      is_staff: role === 'admin',
      is_active: Math.random() < 0.95,
      created_at: randomDate(startDate, now),
      notification_preferences: {
        email: Math.random() < 0.7,
        sms: Math.random() < 0.4,
        push: Math.random() < 0.6,
        budget_alerts: Math.random() < 0.8,
        price_alerts: Math.random() < 0.5,
        weekly_digest: Math.random() < 0.3,
      },
      onboarding_completed: Math.random() < 0.85,
    });
  }

  await prisma.users_user.createMany({ data: usersData });
  console.log(`✅ Created ${usersData.length} users\n`);

  // ============================================================
  // 2. VENDORS (200)
  // ============================================================
  console.log('🏪 Creating vendors...');
  const vendorUsers = usersData.filter(u => u.role === 'vendor');
  const potentialVendors = [...vendorUsers, ...usersData.filter(u => u.role === 'consumer').slice(0, 200 - vendorUsers.length)];

  const vendorsData = [];
  const cityCoords: Record<string, [number, number]> = {
    "Addis Ababa": [9.0054, 38.7636], "Dire Dawa": [9.6000, 41.8667], "Mekelle": [13.4967, 39.4753],
    "Gondar": [12.6000, 37.4667], "Bahir Dar": [11.6000, 37.3833], "Hawassa": [7.0500, 38.4667],
    "Jimma": [7.6667, 36.8333], "Dessie": [11.1333, 39.6333], "Jijiga": [9.3500, 42.8000],
    "Shashamane": [7.2000, 38.6000], "Bishoftu": [8.7500, 38.9833], "Adama": [8.5400, 39.2700],
    "Harar": [9.3167, 42.1167], "Arba Minch": [6.0333, 37.5500], "Hosaena": [7.5500, 37.8500],
    "Debre Birhan": [9.6833, 39.5333], "Debre Markos": [10.3500, 37.7333], "Sodo": [6.8500, 37.7500],
    "Dilla": [6.4000, 38.3167], "Nekemte": [9.0833, 36.5500], "Axum": [14.1333, 38.7167],
    "Gambela": [8.2500, 34.5833], "Asosa": [10.0667, 34.5333], "Semera": [11.7833, 40.9833],
    "Wolaita Sodo": [6.8500, 37.7500], "Woldiya": [11.8333, 39.6000], "Kombolcha": [11.0833, 39.7333],
    "Debre Tabor": [11.8500, 38.0167], "Ambo": [8.9833, 37.8667], "Burayu": [9.0333, 38.7000],
  };

  for (let i = 0; i < Math.min(200, potentialVendors.length); i++) {
    const owner = potentialVendors[i];
    const city = owner.city || randomChoice(ETHIOPIAN_CITIES);
    const coords = cityCoords[city] || [randomFloat(3.5, 14.5), randomFloat(33.0, 48.0)];

    vendorsData.push({
      id: uuidv4(),
      shop_name: generateShopName(),
      city: city,
      latitude: coords[0] + randomFloat(-0.05, 0.05),
      longitude: coords[1] + randomFloat(-0.05, 0.05),
      joined_at: randomDate(startDate, now),
      owner_id: owner.id,
      address: generateAddress(city),
      contact_phone: generatePhone(),
      is_verified: Math.random() < 0.7,
      rating_avg: randomFloat(2.5, 5.0),
      rating_count: randomInt(0, 500),
    });
  }

  await prisma.users_vendor.createMany({ data: vendorsData });
  console.log(`✅ Created ${vendorsData.length} vendors\n`);

  // ============================================================
  // 3. MARKET ITEMS (80)
  // ============================================================
  console.log('📦 Creating market items...');
  const itemsData: MarketItemSeed[] = MARKET_ITEMS.map((item, idx) => ({
    id: idx + 1,
    name: item.name,
    category: item.category,
    unit: item.unit,
    priceRange: item.priceRange,
  }));

  await prisma.market_item.createMany({
    data: itemsData.map(({ id, name, category, unit }) => ({
      id,
      name,
      category,
      unit,
    })),
  });
  console.log(`✅ Created ${itemsData.length} market items\n`);

  // ============================================================
  // 4. BUDGETS (800)
  // ============================================================
  console.log('💰 Creating budgets...');
  const budgetsData = [];
  for (let i = 0; i < 800; i++) {
    const user = randomChoice(usersData);
    let baseLimit = randomFloat(3000, 25000);
    if (user.income_bracket) {
      if (user.income_bracket.includes("Below")) baseLimit = randomFloat(2000, 4000);
      else if (user.income_bracket.includes("3,000")) baseLimit = randomFloat(4000, 7000);
      else if (user.income_bracket.includes("5,000")) baseLimit = randomFloat(6000, 10000);
      else if (user.income_bracket.includes("8,000")) baseLimit = randomFloat(10000, 18000);
      else if (user.income_bracket.includes("15,000")) baseLimit = randomFloat(18000, 30000);
      else if (user.income_bracket.includes("25,000")) baseLimit = randomFloat(30000, 55000);
      else baseLimit = randomFloat(50000, 150000);
    }

    budgetsData.push({
      id: i + 1,
      month: randomInt(1, 12),
      year: randomChoice([2024, 2025, 2026]),
      total_limit: baseLimit,
      created_at: randomDate(startDate, now),
      user_id: user.id,
    });
  }

  await prisma.finance_budget.createMany({ data: budgetsData });
  console.log(`✅ Created ${budgetsData.length} budgets\n`);

  // ============================================================
  // 5. BUDGET CATEGORIES (~2500)
  // ============================================================
  console.log('📊 Creating budget categories...');
  const budgetCategoriesData = [];
  let catId = 1;
  for (const budget of budgetsData) {
    const numCats = randomInt(3, 8);
    const selectedCats = BUDGET_CATEGORIES.sort(() => Math.random() - 0.5).slice(0, numCats);
    const weights = Array.from({ length: numCats }, () => Math.random());
    const totalWeight = weights.reduce((a, b) => a + b, 0);

    for (let i = 0; i < numCats; i++) {
      budgetCategoriesData.push({
        id: catId++,
        category_name: selectedCats[i],
        limit_amount: Math.round(budget.total_limit * (weights[i] / totalWeight) * 100) / 100,
        budget_id: budget.id,
      });
    }
  }

  await prisma.finance_budgetcategory.createMany({ data: budgetCategoriesData });
  console.log(`✅ Created ${budgetCategoriesData.length} budget categories\n`);

  // ============================================================
  // 6. EXPENSES (5000)
  // ============================================================
  console.log('💸 Creating expenses...');
  const expensesData = [];
  for (let i = 0; i < 5000; i++) {
    const user = randomChoice(usersData);
    const useItem = Math.random() < 0.6;
    const item = useItem ? randomChoice(itemsData) : null;
    const category = item ? item.category : randomChoice(EXPENSE_CATEGORIES);

    let amount = randomFloat(50, 3000);
    if (category === "Food & Groceries" || category === "Fuel") amount = randomFloat(50, 2000);
    else if (["Housing", "Healthcare"].includes(category)) amount = randomFloat(500, 10000);
    else if (category === "Transportation") amount = randomFloat(20, 500);
    else if (category === "Education") amount = randomFloat(100, 5000);

    expensesData.push({
      id: i + 1,
      category: category,
      amount: amount,
      payment_method: Math.random() < 0.9 ? randomChoice(PAYMENT_METHODS) : null,
      date: randomDate(startDate, now),
      note: Math.random() < 0.7 ? randomChoice([
        "Weekly grocery shopping", "Monthly rent payment", "Transport to work",
        "Medical checkup", "School fees", "Utility bill", "Emergency purchase",
        "Family gathering", "Religious holiday expenses", "Market day shopping",
        "Online purchase", "Subscription renewal", "Repair costs", "Gift purchase",
        "Charity donation", "Investment", "Savings deposit", "Loan repayment",
      ]) : null,
      item_id: item ? item.id : null,
      user_id: user.id,
      vendor_id: Math.random() < 0.4 ? randomChoice(vendorsData).id : null,
    });
  }

  await prisma.finance_expense.createMany({ data: expensesData });
  console.log(`✅ Created ${expensesData.length} expenses\n`);

  // ============================================================
  // 7. TRANSACTIONS (3000)
  // ============================================================
  console.log('🛒 Creating transactions...');
  const transactionsData = [];
  for (let i = 0; i < 3000; i++) {
    transactionsData.push({
      id: uuidv4(),
      amount: randomFloat(50, 5000),
      currency: Math.random() < 0.98 ? "ETB" : "USD",
      status: randomChoice(TX_STATUSES),
      reference: `TXN-${randomInt(100000, 999999)}-${randomInt(1000, 9999)}`,
      created_at: randomDate(startDate, now),
      user_id: randomChoice(usersData).id,
      vendor_id: randomChoice(vendorsData).id,
    });
  }

  await prisma.ecommerce_transaction.createMany({ data: transactionsData });
  console.log(`✅ Created ${transactionsData.length} transactions\n`);

  // ============================================================
  // 8. PRICE SUBMISSIONS (8000)
  // ============================================================
  console.log('📤 Creating price submissions...');
  const submissionsData = [];
  for (let i = 0; i < 8000; i++) {
    const item = randomChoice(itemsData);
    submissionsData.push({
      id: i + 1,
      price_value: randomFloat(item.priceRange[0] * 0.8, item.priceRange[1] * 1.2),
      market_location: randomChoice([
        "Merkato", "Shola Market", "Bole Market", "Piassa Market", 
        "Kazanchis Market", "Saris Market", "Alemgena Market",
        "Central Market", "Local Souq", "Street Vendor", "Supermarket",
        "Mini-Mart", "Wholesale Market", "Open Market", "Farmers Market"
      ]),
      city: randomChoice(ETHIOPIAN_CITIES),
      date_observed: randomDate(startDate, now),
      status: randomChoice(SUBMISSION_STATUSES),
      created_at: randomDate(startDate, now),
      item_id: item.id,
      user_id: randomChoice(usersData).id,
    });
  }

  await prisma.market_pricesubmission.createMany({ data: submissionsData });
  console.log(`✅ Created ${submissionsData.length} price submissions\n`);

  // ============================================================
  // 9. VENDOR PRICES (15000)
  // ============================================================
  console.log('🏷️ Creating vendor prices...');
  const vendorPricesData = [];
  for (let i = 0; i < 15000; i++) {
    const item = randomChoice(itemsData);
    vendorPricesData.push({
      id: i + 1,
      price: randomFloat(item.priceRange[0] * 0.85, item.priceRange[1] * 1.15),
      date: randomDate(startDate, now),
      is_verified: Math.random() < 0.8,
      item_id: item.id,
      vendor_id: randomChoice(vendorsData).id,
    });
  }

  await prisma.market_vendorprice.createMany({ data: vendorPricesData });
  console.log(`✅ Created ${vendorPricesData.length} vendor prices\n`);

  // ============================================================
  // 10. NATIONAL PRICES (10000)
  // ============================================================
  console.log('🇪🇹 Creating national prices...');
  const nationalPricesData = [];
  for (let i = 0; i < 10000; i++) {
    const item = randomChoice(itemsData);
    nationalPricesData.push({
      id: i + 1,
      price: randomFloat(item.priceRange[0] * 0.9, item.priceRange[1] * 1.1),
      source: randomChoice(["CSA", "MoT", "WFP", "FEWS NET", "Local Market", "Vendor Survey", "Consumer Report"]),
      city: randomChoice(ETHIOPIAN_CITIES),
      date: randomDate(startDate, now),
      item_id: item.id,
    });
  }

  await prisma.market_nationalprice.createMany({ data: nationalPricesData });
  console.log(`✅ Created ${nationalPricesData.length} national prices\n`);

  // ============================================================
  // 11. FORECASTS (2000)
  // ============================================================
  console.log('🔮 Creating price forecasts...');
  const forecastsData = [];
  for (let i = 0; i < 2000; i++) {
    const item = randomChoice(itemsData);
    const basePrice = randomFloat(item.priceRange[0], item.priceRange[1]);
    const trend = randomFloat(-0.1, 0.15);
    const predicted = Math.round(basePrice * (1 + trend) * 100) / 100;

    forecastsData.push({
      id: i + 1,
      forecast_date: new Date(now.getTime() + randomInt(1, 28) * 24 * 60 * 60 * 1000),
      predicted_price: predicted,
      model_used: randomChoice(ML_MODELS),
      confidence_low: Math.round(predicted * randomFloat(0.85, 0.95) * 100) / 100,
      confidence_high: Math.round(predicted * randomFloat(1.05, 1.20) * 100) / 100,
      generated_at: randomDate(startDate, now),
      item_id: item.id,
    });
  }

  await prisma.market_forecast.createMany({ data: forecastsData });
  console.log(`✅ Created ${forecastsData.length} forecasts\n`);

  // ============================================================
  // 12. NOTIFICATIONS (3000)
  // ============================================================
  console.log('🔔 Creating notifications...');
  const notificationsData = [];
  for (let i = 0; i < 3000; i++) {
    const type = randomChoice(NOTIFICATION_TYPES);
    const messages: Record<string, string[]> = {
      budget_alert: ["You have reached 80% of your monthly budget for Food & Groceries.", "Warning: Your Housing budget is almost exhausted.", "Budget alert: 90% of Transportation budget used."],
      price_spike: [`Price spike detected: ${randomChoice(itemsData).name} prices increased in your area.`, "Urgent: Significant price increase detected in your tracked items."],
      price_drop: [`Good news! ${randomChoice(itemsData).name} prices dropped.`, "Price drop alert: Your watched items are now cheaper."],
      vendor_nearby: [`New verified vendor nearby in your area.`, "A highly-rated vendor just joined in your area."],
      forecast_ready: ["New price forecast available.", "Weekly market forecast is ready for your review."],
      system: ["Your account verification is complete.", "System maintenance scheduled for tonight.", "New feature available: Advanced budget analytics."],
      transaction: ["Transaction completed successfully.", "Your payment has been received.", "Refund processed for your recent purchase."],
      reminder: ["Don't forget to log your expenses for today.", "Weekly budget review reminder.", "Your monthly report is ready."],
    };

    notificationsData.push({
      id: i + 1,
      type: type,
      message: randomChoice(messages[type] || ["New notification from SpendSense."]),
      is_read: Math.random() < 0.6,
      created_at: randomDate(startDate, now),
      user_id: randomChoice(usersData).id,
    });
  }

  await prisma.users_notification.createMany({ data: notificationsData });
  console.log(`✅ Created ${notificationsData.length} notifications\n`);

  // ============================================================
  // 13. AUDIT LOGS (2000)
  // ============================================================
  console.log('📋 Creating audit logs...');
  const auditLogsData = [];
  for (let i = 0; i < 2000; i++) {
    auditLogsData.push({
      id: i + 1,
      action: randomChoice(AUDIT_ACTIONS),
      resource: randomChoice(AUDIT_RESOURCES),
      resource_id: String(randomInt(1, 10000)),
      detail: {
        action: randomChoice(AUDIT_ACTIONS),
        resource: randomChoice(AUDIT_RESOURCES),
        resource_id: String(randomInt(1, 10000)),
        ip_address: `${randomInt(1, 255)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(0, 255)}`,
      },
      created_at: randomDate(startDate, now),
      actor_id: Math.random() < 0.9 ? randomChoice(usersData).id : null,
    });
  }

  await prisma.users_auditlog.createMany({ data: auditLogsData });
  console.log(`✅ Created ${auditLogsData.length} audit logs\n`);

  // ============================================================
  // 14. SYSTEM SETTINGS (12)
  // ============================================================
  console.log('⚙️ Creating system settings...');
  const settingsData = [
    { id: 1, key: 'platform_name', value: '"SpendSense Ethiopia"', updated_at: now, updated_by_id: randomChoice(usersData).id },
    { id: 2, key: 'default_currency', value: '"ETB"', updated_at: now, updated_by_id: randomChoice(usersData).id },
    { id: 3, key: 'price_spike_threshold', value: '0.15', updated_at: now, updated_by_id: randomChoice(usersData).id },
    { id: 4, key: 'budget_alert_threshold', value: '0.80', updated_at: now, updated_by_id: randomChoice(usersData).id },
    { id: 5, key: 'forecast_horizon_weeks', value: '4', updated_at: now, updated_by_id: randomChoice(usersData).id },
    { id: 6, key: 'vendor_verification_required', value: 'true', updated_at: now, updated_by_id: randomChoice(usersData).id },
    { id: 7, key: 'min_price_submission_confidence', value: '0.75', updated_at: now, updated_by_id: randomChoice(usersData).id },
    { id: 8, key: 'notification_cooldown_hours', value: '24', updated_at: now, updated_by_id: randomChoice(usersData).id },
    { id: 9, key: 'max_budget_categories', value: '12', updated_at: now, updated_by_id: randomChoice(usersData).id },
    { id: 10, key: 'data_retention_days', value: '365', updated_at: now, updated_by_id: randomChoice(usersData).id },
    { id: 11, key: 'ml_model_version', value: '"SARIMA_v2.1"', updated_at: now, updated_by_id: randomChoice(usersData).id },
    { id: 12, key: 'supported_cities', value: JSON.stringify(ETHIOPIAN_CITIES), updated_at: now, updated_by_id: randomChoice(usersData).id },
  ];

  await prisma.users_systemsetting.createMany({ data: settingsData });
  console.log(`✅ Created ${settingsData.length} system settings\n`);

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('🎉 Seeding completed successfully!');
  console.log(`⏱️ Duration: ${duration}s`);
  console.log('\n📊 Final counts:');
  console.log(`   Users: ${usersData.length}`);
  console.log(`   Vendors: ${vendorsData.length}`);
  console.log(`   Market Items: ${itemsData.length}`);
  console.log(`   Budgets: ${budgetsData.length}`);
  console.log(`   Budget Categories: ${budgetCategoriesData.length}`);
  console.log(`   Expenses: ${expensesData.length}`);
  console.log(`   Transactions: ${transactionsData.length}`);
  console.log(`   Price Submissions: ${submissionsData.length}`);
  console.log(`   Vendor Prices: ${vendorPricesData.length}`);
  console.log(`   National Prices: ${nationalPricesData.length}`);
  console.log(`   Forecasts: ${forecastsData.length}`);
  console.log(`   Notifications: ${notificationsData.length}`);
  console.log(`   Audit Logs: ${auditLogsData.length}`);
  console.log(`   System Settings: ${settingsData.length}`);
  console.log(`   TOTAL: ${usersData.length + vendorsData.length + itemsData.length + budgetsData.length + budgetCategoriesData.length + expensesData.length + transactionsData.length + submissionsData.length + vendorPricesData.length + nationalPricesData.length + forecastsData.length + notificationsData.length + auditLogsData.length + settingsData.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    // process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
