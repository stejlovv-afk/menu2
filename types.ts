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
  uid: string; // Unique ID for cart entry
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

export interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  MainButton: {
    show: () => void;
    hide: () => void;
    setText: (text: string) => void;
    onClick: (cb: () => void) => void;
    offClick: (cb: () => void) => void;
  };
  sendData: (data: string) => void;
  showAlert: (message: string) => void;
  showConfirm: (message: string, callback: (ok: boolean) => void) => void;
  initDataUnsafe: any;
}
