export type Category = 'coffee' | 'tea' | 'punsh' | 'seasonal' | 'ice' | 'food' | 'drinks';

export interface MenuItem {
  id: number;
  cat: Category;
  name: string;
  price?: number;
  sizes?: Record<string, number>;
  img: string;
  noMilk?: boolean;
  noSyrup?: boolean;
  isBumble?: boolean;
}

export interface CartItem {
  uid: string;
  id: number;
  name: string;
  baseName: string;
  price: number;
  details: string;
}

export interface SelectedOptions {
  size: { label: string; price: number } | null;
  milk: string | null;
  syrup: string | null;
  temp: 'Теплый' | 'Холодный' | null;
  sugar: string | null;
  cinnamon: boolean;
  juice: string | null;
}
