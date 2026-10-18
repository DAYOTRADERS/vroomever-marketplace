// Vehicle makes shown under Cars & Vehicles; logos come from the Simple Icons CDN (initials shown if a logo is missing).
export const carMakes: { name: string; logo: string }[] = [
  ["Toyota", "toyota"], ["Honda", "honda"], ["Nissan", "nissan"], ["Mazda", "mazda"], ["Suzuki", "suzuki"],
  ["Mitsubishi", "mitsubishi"], ["Daihatsu", "daihatsu"], ["Subaru", "subaru"], ["Hino", "hino"], ["Volkswagen", "volkswagen"],
  ["BMW", "bmw"], ["Isuzu", "isuzu"], ["Lexus", "lexus"], ["Mercedes", "mercedes"], ["Audi", "audi"], ["Volvo", "volvo"],
  ["Land Rover", "landrover"], ["Ford", "ford"], ["Peugeot", "peugeot"], ["Jeep", "jeep"], ["Citroen", "citroen"],
  ["Jaguar", "jaguar"], ["Hyundai", "hyundai"], ["Kia", "kia"],
].map(([name, slug]) => ({ name: name!, logo: `https://cdn.simpleicons.org/${slug}` }));
