// Vehicle brand marks use direct SVG logo images from Simple Icons (initials are the fallback).
type Make = { name: string; logo: string };
const logoSlugs: Record<string, string> = {
  Toyota: "toyota", Honda: "honda", Nissan: "nissan", Mazda: "mazda", Suzuki: "suzuki",
  Mitsubishi: "mitsubishi", Subaru: "subaru", Volkswagen: "volkswagen", BMW: "bmw",
  "Mercedes-Benz": "mercedesbenz", Audi: "audi", Lexus: "lexus", "Land Rover": "landrover",
  Ford: "ford", Hyundai: "hyundai", Kia: "kia", Peugeot: "peugeot", Volvo: "volvo",
  Jeep: "jeep", Porsche: "porsche", Isuzu: "isuzu", Scania: "scania", "Mitsubishi Fuso": "mitsubishi",
  Hino: "hino", Yutong: "yutong", "King Long": "kinglong", Bajaj: "bajaj", TVS: "tvs",
  Yamaha: "yamaha", Kawasaki: "kawasaki", Boxer: "bajaj", Haojue: "haojue", KTM: "ktm",
  "BMW Motorrad": "bmw", Ducati: "ducati", "Harley-Davidson": "harleydavidson", MAN: "man",
  Tata: "tatamotors", Sinotruk: "sinotruk", DAF: "daf", Iveco: "iveco", "Renault Trucks": "renault",
};
const pointers=import.meta.glob("@/assets/brands/*.asset.json", {eager:true,import:"default"}) as Record<string,{url:string}>;
const stored=Object.fromEntries(Object.entries(pointers).map(([path,p])=>[(path.split("/").pop() ?? "").split(".")[0],p.url]));
const build = (list: [string, string][]): Make[] =>
 list.map(([name]) => ({name,logo:stored[name.toLowerCase().replace(/[^a-z0-9]/g, "")] ?? `https://cdn.simpleicons.org/${logoSlugs[name] ?? name.toLowerCase().replace(/[^a-z0-9]/g, "")}`}));

export const carMakes = build([
  ["Toyota", "toyota.com"], ["Honda", "honda.com"], ["Nissan", "nissanusa.com"], ["Mazda", "mazda.com"], ["Suzuki", "suzuki.co.jp"],
  ["Mitsubishi", "mitsubishi-motors.com"], ["Subaru", "subaru.com"], ["Volkswagen", "vw.com"], ["BMW", "bmw.com"], ["Mercedes-Benz", "mercedes-benz.com"],
  ["Audi", "audi.com"], ["Lexus", "lexus.com"], ["Land Rover", "landrover.com"], ["Ford", "ford.com"], ["Hyundai", "hyundai.com"],
  ["Kia", "kia.com"], ["Peugeot", "peugeot.com"], ["Volvo", "volvocars.com"], ["Jeep", "jeep.com"], ["Porsche", "porsche.com"],
]);
export const busMakes = build([
  ["Toyota", "toyota.com"], ["Isuzu", "isuzu.com"], ["Mitsubishi Fuso", "mitsubishi-fuso.com"], ["Scania", "scania.com"], ["Mercedes-Benz", "mercedes-benz.com"],
  ["Nissan", "nissanusa.com"], ["Hino", "hino-global.com"], ["Yutong", "yutong.com"], ["King Long", "king-long.com"], ["Volvo", "volvobuses.com"],
]);
export const truckMakes = build([
  ["Isuzu", "isuzu.com"], ["Mitsubishi Fuso", "mitsubishi-fuso.com"], ["Hino", "hino-global.com"], ["Scania", "scania.com"], ["Mercedes-Benz", "mercedes-benz.com"],
  ["Volvo", "volvotrucks.com"], ["MAN", "man.eu"], ["Tata", "tatamotors.com"], ["Sinotruk", "sinotruk.com"], ["DAF", "daf.com"],
  ["Iveco", "iveco.com"], ["Renault Trucks", "renault-trucks.com"],
]);
export const motorcycleMakes = build([
  ["Bajaj", "bajajauto.com"], ["TVS", "tvsmotor.com"], ["Honda", "honda.com"], ["Yamaha", "yamaha-motor.com"], ["Suzuki", "suzuki.co.jp"],
  ["Kawasaki", "kawasaki.com"], ["Boxer", "bajajauto.com"], ["Haojue", "haojue.com"], ["KTM", "ktm.com"], ["BMW Motorrad", "bmw-motorrad.com"],
  ["Ducati", "ducati.com"], ["Harley-Davidson", "harley-davidson.com"],
]);

export function makesFor(subcategory: string): Make[] | null {
  return ({ Cars: carMakes, Buses: busMakes, Trucks: truckMakes, Motorcycles: motorcycleMakes } as Record<string, Make[]>)[subcategory] ?? null;
}
