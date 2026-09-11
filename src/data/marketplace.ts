import {
  Baby, BriefcaseBusiness, Building2, Car, Cat, CookingPot, Drill, Dumbbell,
  Factory, Gem, Hammer, HeartPulse, House, Shirt, Smartphone, Sparkles,
  type LucideIcon,
} from "lucide-react";
import suv from "@/assets/product-suv.jpg";
import phone from "@/assets/product-phone.jpg";
import sofa from "@/assets/product-sofa.jpg";
import land from "@/assets/product-land.jpg";

export type Category = { slug: string; name: string; icon: LucideIcon; subcategories: string[] };
export const categories: Category[] = [
  { slug: "cars", name: "Cars", icon: Car, subcategories: ["Cars", "Vehicle Parts", "Motorcycles", "Buses", "Trucks", "Heavy Machinery", "Boats", "Personal Mobility", "Car Services"] },
  { slug: "fashion", name: "Fashion", icon: Shirt, subcategories: ["Women's Clothing", "Men's Clothing", "Shoes", "Bags", "Watches", "Jewellery", "Accessories"] },
  { slug: "food-stuff", name: "Food Stuff", icon: CookingPot, subcategories: ["Cereals", "Fresh Produce", "Beverages", "Dairy", "Meat & Poultry", "Snacks", "Wholesale Food"] },
  { slug: "gem-stones", name: "Gem Stones", icon: Gem, subcategories: ["Cut Gemstones", "Rough Stones", "Gold", "Silver", "Minerals", "Jewellery Tools"] },
  { slug: "furniture", name: "Furniture", icon: Hammer, subcategories: ["Sofas", "Beds", "Dining", "Office Furniture", "Outdoor", "Décor", "Storage"] },
  { slug: "property", name: "Property", icon: House, subcategories: ["Houses for Sale", "Apartments", "Land", "Commercial", "Short Lets", "Property Services"] },
  { slug: "leisure", name: "Leisure", icon: Dumbbell, subcategories: ["Sports Equipment", "Musical Instruments", "Books", "Gaming", "Camping", "Collectibles"] },
  { slug: "phones-tablets", name: "Phones & Tablets", icon: Smartphone, subcategories: ["Smartphones", "Tablets", "Accessories", "Smart Watches", "Feature Phones", "Repairs"] },
  { slug: "beauty", name: "Beauty & Personal Care", icon: Sparkles, subcategories: ["Skincare", "Hair Care", "Fragrance", "Makeup", "Personal Care", "Salon Equipment"] },
  { slug: "repair-construction", name: "Repair & Construction", icon: Drill, subcategories: ["Building Materials", "Power Tools", "Plumbing", "Electrical", "Hand Tools", "Contractors"] },
  { slug: "commercial-equipment", name: "Commercial Equipment", icon: Building2, subcategories: ["Restaurant Equipment", "Medical Equipment", "Printing", "Retail Equipment", "Industrial Tools"] },
  { slug: "babies-kids", name: "Babies & Kids", icon: Baby, subcategories: ["Baby Clothing", "Toys", "Prams", "Kids Furniture", "School Supplies", "Maternity"] },
  { slug: "animals-pets", name: "Animals & Pets", icon: Cat, subcategories: ["Dogs", "Cats", "Farm Animals", "Birds", "Pet Food", "Pet Services"] },
  { slug: "jobs", name: "Jobs", icon: BriefcaseBusiness, subcategories: ["Technology", "Sales", "Hospitality", "Construction", "Healthcare", "Remote Work"] },
  { slug: "business-industry", name: "Business & Industry", icon: Factory, subcategories: ["Manufacturing", "Agriculture", "Office Equipment", "Wholesale", "Business Sales"] },
  { slug: "services", name: "Services", icon: HeartPulse, subcategories: ["Cleaning", "Transport", "Photography", "Events", "Tutoring", "Health & Wellness", "Professional"] },
];

export const products = [
  { id: "land-cruiser-v8", title: "Toyota Land Cruiser V8, 2018", price: 7850000, location: "Karen, Nairobi", condition: "Foreign Used", seller: "Prestige Motors KE", category: "cars", image: suv, vip: true, verified: true, views: 1248 },
  { id: "graphite-pro-phone", title: "Graphite Pro 256GB, Mint", price: 118000, location: "CBD, Nairobi", condition: "Used", seller: "Gadget Grid", category: "phones-tablets", image: phone, vip: false, verified: true, views: 804 },
  { id: "emerald-sofa", title: "Emerald 3-Seater Premium Sofa", price: 74900, location: "Kilimani, Nairobi", condition: "Brand New", seller: "Nairobi Living", category: "furniture", image: sofa, vip: true, verified: true, views: 527 },
  { id: "limuru-plots", title: "Serviced 50×100 Plots", price: 1450000, location: "Tigoni, Kiambu", condition: "Ready Title", seller: "Horizon Properties", category: "property", image: land, vip: false, verified: true, views: 965 },
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
