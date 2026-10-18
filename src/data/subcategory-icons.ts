import {
  Car, Cog, Bike, Bus, Truck, Construction, Ship, Zap, Wrench, House, Building, Trees, Store, BedDouble, Briefcase,
  Smartphone, Tablet, Headphones, Watch, Phone, Tv, Speaker, Camera, Laptop, Gamepad2, Cable, Cpu, Shirt, Footprints,
  ShoppingBag, Gem, Sofa, Utensils, Armchair, Flower2, Archive, Refrigerator, CookingPot, WashingMachine, Microwave,
  Blend, AirVent, Wheat, Apple, CupSoda, Milk, Drumstick, Cookie, Package, Tractor, Beef, Sprout, FlaskConical,
  Shovel, Mountain, Coins, Sparkles, Droplets, SprayCan, Palette, HandHeart, Scissors, BrickWall, Drill, Plug,
  Hammer, HardHat, ChefHat, Stethoscope, Printer, Factory, Baby, ToyBrick, Backpack, Dog, Cat, Bird, PawPrint,
  Dumbbell, Music, BookOpen, Tent, Trophy, Code, TrendingUp, Hotel, HeartPulse, Globe, Truck as Van, PartyPopper,
  GraduationCap, Accessibility, Pill, Pencil, Tag, type LucideIcon,
} from "lucide-react";

const rules: [RegExp, LucideIcon][] = [
  [/vehicle parts|parts/i, Cog], [/motorcycle/i, Bike], [/bus/i, Bus], [/truck/i, Truck], [/heavy machinery/i, Construction],
  [/boat/i, Ship], [/mobility aid/i, Accessibility], [/personal mobility/i, Zap], [/car services|repairs/i, Wrench], [/^cars$/i, Car],
  [/houses/i, House], [/apartment/i, Building], [/^land$/i, Trees], [/commercial$/i, Store], [/short let/i, BedDouble], [/property services/i, Briefcase],
  [/smartphone/i, Smartphone], [/tablet/i, Tablet], [/smart watch|watches/i, Watch], [/feature phone/i, Phone],
  [/tv/i, Tv], [/audio/i, Speaker], [/camera|photography/i, Camera], [/computer/i, Laptop], [/gaming/i, Gamepad2], [/other electronics/i, Cpu],
  [/clothing/i, Shirt], [/shoes/i, Footprints], [/bags/i, ShoppingBag], [/jewel|gemstone|rough stone/i, Gem], [/gold|silver/i, Coins], [/mineral/i, Mountain],
  [/sofa/i, Sofa], [/beds/i, BedDouble], [/dining/i, Utensils], [/office furniture/i, Armchair], [/outdoor/i, Flower2], [/d[ée]cor/i, Palette], [/storage/i, Archive],
  [/fridge/i, Refrigerator], [/cooker/i, CookingPot], [/washing/i, WashingMachine], [/microwave/i, Microwave], [/small appliance/i, Blend], [/air condition/i, AirVent],
  [/cereal/i, Wheat], [/fresh produce|^produce$/i, Apple], [/beverage/i, CupSoda], [/dairy/i, Milk], [/meat|poultry/i, Drumstick], [/snack/i, Cookie], [/wholesale/i, Package],
  [/farm machinery/i, Tractor], [/livestock|farm animal/i, Beef], [/seed/i, Sprout], [/fertilizer/i, FlaskConical], [/animal feed|pet food/i, PawPrint], [/farm tools/i, Shovel],
  [/skincare/i, Sparkles], [/hair care/i, Droplets], [/fragrance/i, SprayCan], [/makeup/i, Palette], [/personal care/i, HandHeart], [/salon/i, Scissors],
  [/building material/i, BrickWall], [/power tool/i, Drill], [/plumbing/i, Wrench], [/electrical/i, Plug], [/hand tool|industrial tool/i, Hammer], [/contractor|construction/i, HardHat],
  [/restaurant/i, ChefHat], [/medical|dental|health/i, Stethoscope], [/print/i, Printer], [/retail/i, Store], [/manufactur/i, Factory], [/agriculture/i, Tractor],
  [/office equipment|business supplies|business sales/i, Briefcase], [/baby|maternity/i, Baby], [/pram/i, Baby], [/toys/i, ToyBrick], [/kids furniture/i, Armchair], [/school/i, Backpack],
  [/dogs/i, Dog], [/cats/i, Cat], [/birds/i, Bird], [/pet services/i, PawPrint], [/sports/i, Dumbbell], [/musical/i, Music], [/books|stationery/i, BookOpen],
  [/camping/i, Tent], [/collectible/i, Trophy], [/technology/i, Code], [/sales/i, TrendingUp], [/hospitality/i, Hotel], [/healthcare|care services/i, HeartPulse],
  [/remote/i, Globe], [/cleaning/i, Sparkles], [/transport/i, Van], [/events/i, PartyPopper], [/tutoring/i, GraduationCap], [/wellness|fitness/i, HeartPulse],
  [/pharmacy/i, Pill], [/professional/i, Briefcase], [/supplies/i, Pencil], [/accessor/i, Headphones], [/accessor/i, Cable],
];
export function subcategoryIcon(name: string): LucideIcon {
  return rules.find(([re]) => re.test(name))?.[1] ?? Tag;
}
