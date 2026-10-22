// Vehicle brands per subcategory; logos come from each brand's official website icon (initials shown if a logo fails).
type Make = { name: string; logo: string };
const build = (list: [string, string][]): Make[] =>
  list.map(([name, domain]) => ({ name, logo: `https://www.google.com/s2/favicons?domain=${domain}&sz=128` }));

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
