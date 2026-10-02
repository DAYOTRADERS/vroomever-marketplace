export type CardProduct = {
  id: string;
  title: string;
  price: number;
  location: string | null;
  condition: string | null;
  image: string;
  seller: string;
  vip?: boolean;
  verified?: boolean;
  category?: string;
  views?: number;
};
