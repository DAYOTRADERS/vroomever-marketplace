import {
  Baby, BriefcaseBusiness, Building2, Car, Cat, CookingPot, Drill, Dumbbell,
  Factory, Gem, Hammer, HeartPulse, House, Shirt, Smartphone, Sparkles,
  Tractor, Refrigerator, Stethoscope, School, MonitorSmartphone,
  type LucideIcon,
} from "lucide-react";
import suv from "@/assets/product-suv.jpg";
import phone from "@/assets/product-phone.jpg";
import sofa from "@/assets/product-sofa.jpg";
import land from "@/assets/product-land.jpg";

export type Category = { slug: string; name: string; icon: LucideIcon; subcategories: string[] };
export const categories: Category[] = [
  { slug: "cars", name: "Cars & Vehicles", icon: Car, subcategories: ["Cars", "Vehicle Parts", "Motorcycles", "Buses", "Trucks", "Heavy Machinery", "Boats", "Personal Mobility", "Car Services"] },
  { slug: "property", name: "Property", icon: House, subcategories: ["Houses for Sale", "Apartments", "Land", "Commercial", "Short Lets", "Property Services"] },
  { slug: "phones-tablets", name: "Phones & Tablets", icon: Smartphone, subcategories: ["Smartphones", "Tablets", "Accessories", "Smart Watches", "Feature Phones", "Repairs"] },
  { slug: "electronics", name: "Electronics", icon: MonitorSmartphone, subcategories: ["TVs", "Audio", "Cameras", "Computers", "Gaming", "Accessories", "Other Electronics"] },
  { slug: "fashion", name: "Fashion", icon: Shirt, subcategories: ["Women's Clothing", "Men's Clothing", "Shoes", "Bags", "Watches", "Jewellery", "Accessories"] },
  { slug: "furniture", name: "Furniture", icon: Hammer, subcategories: ["Sofas", "Beds", "Dining", "Office Furniture", "Outdoor", "Décor", "Storage"] },
  { slug: "home-appliances", name: "Home Appliances", icon: Refrigerator, subcategories: ["Fridges", "Cookers", "Washing Machines", "Microwaves", "Small Appliances", "Air Conditioners"] },
  { slug: "food-stuff", name: "Food Stuff", icon: CookingPot, subcategories: ["Cereals", "Fresh Produce", "Beverages", "Dairy", "Meat & Poultry", "Snacks", "Wholesale Food"] },
  { slug: "agriculture", name: "Agriculture & Farming", icon: Tractor, subcategories: ["Farm Machinery", "Livestock", "Seeds", "Fertilizer", "Animal Feed", "Farm Tools", "Produce"] },
  { slug: "gem-stones", name: "Gemstones & Jewellery", icon: Gem, subcategories: ["Cut Gemstones", "Rough Stones", "Gold", "Silver", "Minerals", "Jewellery"] },
  { slug: "beauty", name: "Beauty & Personal Care", icon: Sparkles, subcategories: ["Skincare", "Hair Care", "Fragrance", "Makeup", "Personal Care", "Salon Equipment"] },
  { slug: "repair-construction", name: "Repair & Construction", icon: Drill, subcategories: ["Building Materials", "Power Tools", "Plumbing", "Electrical", "Hand Tools", "Contractors"] },
  { slug: "commercial-equipment", name: "Commercial Equipment", icon: Building2, subcategories: ["Restaurant Equipment", "Medical Equipment", "Printing", "Retail Equipment", "Industrial Tools"] },
  { slug: "business-industry", name: "Business & Industry", icon: Factory, subcategories: ["Manufacturing", "Agriculture", "Office Equipment", "Wholesale", "Business Sales"] },
  { slug: "babies-kids", name: "Babies & Kids", icon: Baby, subcategories: ["Baby Clothing", "Toys", "Prams", "Kids Furniture", "School Supplies", "Maternity"] },
  { slug: "animals-pets", name: "Animals & Pets", icon: Cat, subcategories: ["Dogs", "Cats", "Farm Animals", "Birds", "Pet Food", "Pet Services"] },
  { slug: "leisure-sports", name: "Leisure & Sports", icon: Dumbbell, subcategories: ["Sports Equipment", "Musical Instruments", "Books", "Gaming", "Camping", "Collectibles"] },
  { slug: "jobs", name: "Jobs", icon: BriefcaseBusiness, subcategories: ["Technology", "Sales", "Hospitality", "Construction", "Healthcare", "Remote Work"] },
  { slug: "services", name: "Services", icon: HeartPulse, subcategories: ["Cleaning", "Transport", "Photography", "Events", "Tutoring", "Health & Wellness", "Professional"] },
  { slug: "health-medical", name: "Health & Medical", icon: Stethoscope, subcategories: ["Medical Supplies", "Fitness & Wellness", "Mobility Aids", "Dental", "Pharmacy Products", "Care Services"] },
  { slug: "office-school", name: "Office & School", icon: School, subcategories: ["Stationery", "Office Furniture", "Printers", "School Supplies", "Books", "Business Supplies"] },
];

export const products = [
  { id: "land-cruiser-v8", title: "Toyota Land Cruiser V8, 2018", price: 7850000, location: "Karen, Nairobi", condition: "Foreign Used", seller: "Prestige Motors KE", category: "cars", image: suv, vip: true, verified: true, views: 1248 },
  { id: "graphite-pro-phone", title: "Graphite Pro 256GB, Mint", price: 118000, location: "CBD, Nairobi", condition: "Used", seller: "Gadget Grid", category: "phones-tablets", image: phone, vip: false, verified: true, views: 804 },
  { id: "emerald-sofa", title: "Emerald 3-Seater Premium Sofa", price: 74900, location: "Kilimani, Nairobi", condition: "Brand New", seller: "Nairobi Living", category: "furniture", image: sofa, vip: true, verified: true, views: 527 },
  { id: "limuru-plots", title: "Serviced 50×100 Plots", price: 1450000, location: "Tigoni, Kiambu", condition: "Ready Title", seller: "Horizon Properties", category: "property", image: land, vip: false, verified: true, views: 965 },
  { id: "smart-tv", title: "55-inch 4K Smart TV", price: 69500, location: "Westlands, Nairobi", condition: "Brand New", seller: "Tech Hub KE", category: "electronics", image: phone, vip: false, verified: true, views: 421 },
  { id: "designer-jacket", title: "Premium Leather Jacket", price: 18500, location: "Kilimani, Nairobi", condition: "Brand New", seller: "Urban Wear KE", category: "fashion", image: sofa, vip: false, verified: true, views: 318 },
  { id: "double-bed", title: "Modern 5×6 King Bed", price: 42000, location: "Ruiru, Kiambu", condition: "Brand New", seller: "HomeCraft Kenya", category: "furniture", image: sofa, vip: false, verified: true, views: 295 },
  { id: "double-door-fridge", title: "Double Door Energy-Saving Fridge", price: 89000, location: "Lavington, Nairobi", condition: "Brand New", seller: "HomeTech Kenya", category: "home-appliances", image: phone, vip: false, verified: true, views: 263 },
  { id: "maize-bags", title: "Certified Maize Grain — 90kg Bags", price: 5200, location: "Nakuru, Kenya", condition: "New", seller: "Rift Valley Supplies", category: "food-stuff", image: land, vip: false, verified: true, views: 188 },
  { id: "farm-tractor", title: "Compact Farm Tractor", price: 1650000, location: "Eldoret, Uasin Gishu", condition: "Used", seller: "AgriMach KE", category: "agriculture", image: suv, vip: false, verified: true, views: 352 },
  { id: "natural-gemstones", title: "Certified Kenyan Gemstone Collection", price: 125000, location: "Nairobi CBD", condition: "New", seller: "Kenya Gems", category: "gem-stones", image: land, vip: true, verified: true, views: 197 },
  { id: "skincare-set", title: "Professional Skincare Set", price: 12500, location: "Kilimani, Nairobi", condition: "Brand New", seller: "Glow Kenya", category: "beauty", image: phone, vip: false, verified: true, views: 239 },
  { id: "power-tools", title: "18-Piece Professional Power Tool Kit", price: 39500, location: "Industrial Area, Nairobi", condition: "Brand New", seller: "BuildPro Kenya", category: "repair-construction", image: land, vip: false, verified: true, views: 176 },
  { id: "restaurant-freezer", title: "Commercial Chest Freezer", price: 112000, location: "Embakasi, Nairobi", condition: "Used", seller: "BizEquip Kenya", category: "commercial-equipment", image: phone, vip: false, verified: true, views: 143 },
  { id: "office-printer", title: "Business Laser Printer", price: 38000, location: "Upper Hill, Nairobi", condition: "Used", seller: "OfficeWorks KE", category: "business-industry", image: phone, vip: false, verified: true, views: 127 },
  { id: "baby-stroller", title: "Premium Baby Stroller", price: 18500, location: "Kileleshwa, Nairobi", condition: "Brand New", seller: "Little Steps KE", category: "babies-kids", image: sofa, vip: false, verified: true, views: 216 },
  { id: "pet-supplies", title: "Complete Pet Care Starter Pack", price: 7500, location: "Rongai, Kajiado", condition: "Brand New", seller: "Paws Kenya", category: "animals-pets", image: phone, vip: false, verified: true, views: 154 },
  { id: "gym-set", title: "Home Gym Equipment Set", price: 68000, location: "Runda, Nairobi", condition: "Brand New", seller: "FitLife Kenya", category: "leisure-sports", image: sofa, vip: false, verified: true, views: 231 },
  { id: "software-developer", title: "Full-Stack Developer — Remote", price: 0, location: "Remote, Kenya", condition: "New Opportunity", seller: "Talent Connect KE", category: "jobs", image: phone, vip: false, verified: true, views: 402 },
  { id: "cleaning-service", title: "Professional Home Cleaning Service", price: 3500, location: "Nairobi, Kenya", condition: "Available", seller: "CleanSpace KE", category: "services", image: sofa, vip: false, verified: true, views: 174 },
  { id: "medical-monitor", title: "Digital Patient Monitoring Kit", price: 24500, location: "Nairobi, Kenya", condition: "Brand New", seller: "MedCare Supplies", category: "health-medical", image: phone, vip: false, verified: true, views: 118 },
  { id: "school-pack", title: "Complete School & Office Starter Pack", price: 8500, location: "Thika, Kiambu", condition: "Brand New", seller: "Stationery House", category: "office-school", image: land, vip: false, verified: true, views: 201 },
];

export const packages = [
  { name: "Bronze", cadence: "monthly", price: 1500, limit: 15, description: "Start selling with the essentials." },
  { name: "Silver", cadence: "monthly", price: 3500, limit: 50, description: "Built for growing businesses.", popular: true },
  { name: "Gold", cadence: "yearly", price: 24000, limit: 250, description: "Maximum reach for established stores." },
];
export const vipOptions = [
  { duration: "3 days", price: 500 }, { duration: "7 days", price: 950 }, { duration: "14 days", price: 1700 }, { duration: "30 days", price: 2900 },
];
export const formatKsh = (value: number) => `KSh ${value.toLocaleString("en-KE")}`;
