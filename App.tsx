import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { ShoppingCart, Coffee, X, Trash2, ShieldCheck, Lock, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Константы и Данные (Встроены для надежности) ---
const IMG_BASE = "https://your-image-url.com/"; // Замените на вашу базу картинок
const CATEGORIES = [
  { id: 'coffee', label: 'Кофе' },
  { id: 'tea', label: 'Чай' },
  { id: 'food', label: 'Еда' }
];

const MILKS = ["Обычное", "Кокосовое", "Миндальное", "Овсяное"];
const SYRUPS = ["Ваниль", "Карамель", "Лесной орех"];

const MENU_ITEMS = [
  { id: 1, cat: 'coffee', name: 'Капучино', sizes: { "200": 150, "300": 200, "400": 250 }, img: 'cappuccino.jpg' },
  { id: 2, cat: 'coffee', name: 'Латте', sizes: { "300": 220, "400": 280 }, img: 'latte.jpg' },
  { id: 3, cat: 'food', name: 'Сэндвич с курицей', price: 290, img: 'sandwich.jpg' }
];

const tg = window.Telegram?.WebApp;

// --- Вспомогательные компоненты ---

const ProductModal = ({ item, onClose, onAdd }) => {
  const [options, setOptions] = useState({
    size: null, milk: null, syrup: null, temp: null, sugar: null, cinnamon: false, juice: null
  });

  const calculatePrice = () => {
    let p = item.price || (options.size ? options.size.price : 0);
    if (options.milk && options.milk !== "Обычное") {
        const isLarge = options.size && parseInt(options.size.label) > 300;
        p += isLarge ? 90 : 70;
    }
    if (options.syrup) {
        const isLarge = options.size && parseInt(options.size.label) > 300;
        p += isLarge ? 50 : 30;
    }
    return p;
  };

  const currentPrice = calculatePrice();
  const canAdd = (item.sizes ? !!options.size : true) && 
                 ((item.cat === 'coffee') ? !!options.temp : true);

  const handleAdd = () => {
    if (!canAdd) {
      if (item.sizes && !options.size) tg?.showAlert("Выберите объем!");
      else if (item.cat === 'coffee' && !options.temp) tg?.showAlert("Выберите температуру!");
      return;
    }
    onAdd(item, options, currentPrice);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div 
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        className="w-full max-w-md bg-white rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto no-scrollbar"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{item.name}</h2>
          <button onClick={onClose} className="p-1 bg-gray-100 rounded-full"><X size={20} /></button>
        </div>

        <div className="space-y-6 pb-24">
          {item.cat === 'coffee' && (
            <div>
              <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase">Температура</h3>
              <div className="flex gap-2">
                {['Теплый', 'Холодный'].map((t) => (
                  <button key={t} onClick={() => setOptions({ ...options, temp: t })}
                    className={`flex-1 py-3 rounded-xl border-2 ${options.temp === t ? 'border-black bg-black text-white' : 'border-gray-100 text-gray-700'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {item.sizes && (
            <div>
              <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase">Объем</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(item.sizes).map(([size, price]) => (
                  <button key={size} onClick={() => setOptions({ ...options, size: { label: size, price } })}
                    className={`py-2 px-4 rounded-xl border-2 ${options.size?.label === size ? 'border-black bg-black text-white' : 'border-gray-100 text-gray-700'}`}>
                    {size} мл
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
          <button onClick={handleAdd} className={`w-full py-4 rounded-xl font-bold ${canAdd ? 'bg-black text-white' : 'bg-gray-200 text-gray-400'}`}>
            Добавить — {currentPrice} ₽
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// --- Основной компонент App ---

const App = () => {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
  const [cart, setCart] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [floor, setFloor] = useState('');
  const [office, setOffice] = useState('');

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, []);

  const handleAddToCart = (item, options, finalPrice) => {
    const details = [options.size?.label, options.temp, options.milk, options.syrup].filter(Boolean).join(' ');
    setCart([...cart, { uid: Math.random().toString(36).substr(2, 9), name: item.name, price: finalPrice, details }]);
    setSelectedItem(null);
  };

  const handleCheckout = () => {
    if (!floor || !office) { tg?.showAlert("Укажите этаж и офис!"); return; }
    tg?.sendData(JSON.stringify({ type: 'order', items: cart, address: `Этаж ${floor}, Офис ${office}` }));
  };

  return (
    <div className="min-h-screen pb-24 bg-white">
      <header className="sticky top-0 bg-white/90 backdrop-blur-md z-40 border-b p-4 text-center">
        <h1 className="text-xl font-black italic">URBAN LUNCH</h1>
        <div className="flex gap-2 overflow-x-auto mt-4 no-scrollbar">
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap ${activeCategory === cat.id ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}>
              {cat.label}
            </button>
          ))}
        </div>
      </header>

      <main className="p-3 grid grid-cols-2 gap-3">
        {MENU_ITEMS.filter(i => i.cat === activeCategory).map(item => (
          <div key={item.id} onClick={() => setSelectedItem(item)} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 active:scale-95 transition">
            <div className="aspect-square bg-gray-100 rounded-xl mb-2 overflow-hidden">
               <img src={IMG_BASE + item.img} className="w-full h-full object-cover" onError={(e) => e.target.src='https://picsum.photos/200'} />
            </div>
            <h3 className="font-bold text-sm truncate">{item.name}</h3>
            <p className="text-orange-500 font-bold text-xs">{item.price || 'Опции'} ₽</p>
          </div>
        ))}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-4 z-40">
        <button onClick={() => setIsCartOpen(false)} className={`flex flex-col items-center ${!isCartOpen ? 'text-black' : 'text-gray-400'}`}>
          <Coffee size={24} /><span className="text-[10px] font-bold">Меню</span>
        </button>
        <button onClick={() => setIsCartOpen(true)} className={`flex flex-col items-center relative ${isCartOpen ? 'text-black' : 'text-gray-400'}`}>
          <ShoppingCart size={24} />
          {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">{cart.length}</span>}
          <span className="text-[10px] font-bold">Корзина</span>
        </button>
      </nav>

      <AnimatePresence>
        {selectedItem && <ProductModal item={selectedItem} onClose={() => setSelectedItem(null)} onAdd={handleAddToCart} />}
      </AnimatePresence>
    </div>
  );
};

// Финальный рендеринг (для Babel в браузере)
const root = createRoot(document.getElementById('root'));
root.render(<App />);

export default App;
