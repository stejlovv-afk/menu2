import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Coffee, X, Trash2, ShieldCheck, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MENU_ITEMS, CATEGORIES, IMG_BASE, MILKS, SYRUPS } from './constants.ts';
import { MenuItem, TelegramWebApp, CartItem, SelectedOptions } from './types.ts';

// Исправление: расширяем интерфейс Window, чтобы TypeScript видел Telegram
declare global {
  interface Window {
    Telegram: {
      WebApp: TelegramWebApp;
    };
  }
}

// Access Telegram WebApp
const tg = window.Telegram?.WebApp;

// --- Helper Components ---

// 1. Modal Component for Customizing Drinks
const ProductModal = ({ 
  item, 
  onClose, 
  onAdd 
}: { 
  item: MenuItem; 
  onClose: () => void; 
  onAdd: (item: MenuItem, options: SelectedOptions, price: number) => void 
}) => {
  const [options, setOptions] = useState<SelectedOptions>({
    size: null,
    milk: null,
    syrup: null,
    temp: null,
    sugar: null,
    cinnamon: false,
    juice: null
  });

  const calculatePrice = () => {
    let p = item.price || (options.size ? options.size.price : 0);
    
    // Add extra costs
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
                  ((item.cat === 'drinks' || item.cat === 'ice') ? !!options.temp : true);

  const handleAdd = () => {
    if (!canAdd) {
      if (item.sizes && !options.size) tg.showAlert("Выберите объем!");
      else if ((item.cat === 'drinks' || item.cat === 'ice') && !options.temp) tg.showAlert("Выберите температуру!");
      return;
    }
    onAdd(item, options, currentPrice);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-md bg-white rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-800 leading-tight pr-4">{item.name}</h2>
          <button onClick={onClose} className="p-1 bg-gray-100 rounded-full hover:bg-gray-200 transition">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="space-y-6 pb-24">
          {/* Temperature - Only for drinks/ice */}
          {(item.cat === 'drinks' || item.cat === 'ice') && (
            <div>
              <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Температура</h3>
              <div className="flex gap-2">
                {['Теплый', 'Холодный'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setOptions({ ...options, temp: options.temp === t ? null : t as any })}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 border-2 ${
                      options.temp === t 
                        ? 'border-black bg-black text-white shadow-lg transform scale-[1.02]' 
                        : 'border-gray-100 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {t === 'Теплый' ? '🌡 Теплый' : '🧊 Холодный'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {item.sizes && (
            <div>
              <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Объем</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(item.sizes).map(([size, price]) => (
                  <button
                    key={size}
                    onClick={() => setOptions({ ...options, size: options.size?.label === size ? null : { label: size, price } })}
                    className={`py-2 px-4 rounded-xl text-sm font-semibold transition-all duration-200 border-2 ${
                      options.size?.label === size 
                        ? 'border-black bg-black text-white shadow-md' 
                        : 'border-gray-100 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {size} мл
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Logic to hide/show options based on type */}
          {(() => {
            const hideExtras = item.cat === 'food' || item.cat === 'drinks';
            const showMilk = !hideExtras && !item.noMilk && item.cat !== 'tea' && item.cat !== 'punsh' && !item.isBumble;
            const showSyrup = !hideExtras && !item.noSyrup && item.cat !== 'punsh';
            const showExtras = !hideExtras;
            const showJuice = item.isBumble;

            return (
              <>
                {showMilk && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Молоко</h3>
                    <div className="flex flex-wrap gap-2">
                      {MILKS.map(m => (
                        <button
                          key={m}
                          onClick={() => setOptions({ ...options, milk: options.milk === m ? null : m })}
                          className={`py-2 px-3 rounded-lg text-xs font-semibold border ${
                            options.milk === m ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {showJuice && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Сок</h3>
                    <div className="flex gap-2">
                      {['Апельсиновый', 'Вишневый'].map(j => (
                        <button
                          key={j}
                          onClick={() => setOptions({ ...options, juice: options.juice === j ? null : j })}
                          className={`py-2 px-3 rounded-lg text-xs font-semibold border ${
                            options.juice === j ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-600'
                          }`}
                        >
                          {j}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {showSyrup && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Сироп</h3>
                    <div className="flex flex-wrap gap-2">
                      {SYRUPS.map(s => (
                        <button
                          key={s}
                          onClick={() => setOptions({ ...options, syrup: options.syrup === s ? null : s })}
                          className={`py-2 px-3 rounded-lg text-xs font-semibold border ${
                            options.syrup === s ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {showExtras && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Добавки</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <button
                         onClick={() => setOptions({ ...options, cinnamon: !options.cinnamon })}
                         className={`py-2 px-3 rounded-lg text-xs font-semibold border ${
                           options.cinnamon ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-600'
                         }`}
                      >
                        Корица
                      </button>
                    </div>
                    <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Сахар</h3>
                    <div className="flex gap-2">
                      {['5г', '10г', '15г'].map(s => (
                        <button
                          key={s}
                          onClick={() => setOptions({ ...options, sugar: options.sugar === s ? null : s })}
                          className={`py-2 px-3 rounded-lg text-xs font-semibold border ${
                            options.sugar === s ? 'border-gray-800 bg-gray-100 text-black' : 'border-gray-200 text-gray-600'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>

        {/* Sticky Action Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 rounded-t-2xl">
          <div className="max-w-md mx-auto">
            <button
              onClick={handleAdd}
              disabled={!canAdd}
              className={`w-full flex justify-between items-center px-6 py-4 rounded-xl text-lg font-bold shadow-lg transition-all duration-300 ${
                canAdd 
                ? 'bg-black text-white hover:scale-[1.02] active:scale-95' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span>Добавить в корзину</span>
              <span>{currentPrice} ₽</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// 2. Main App Component
const App: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stopList, setStopList] = useState<number[]>([]);
  const [floor, setFloor] = useState('');
  const [office, setOffice] = useState('');

  // Admin secret trigger state
  const titleTouchRef = useRef<{ timer: any, active: boolean }>({ timer: null, active: false });

  useEffect(() => {
    // Init Telegram Web App
    if (tg) {
      tg.ready();
      tg.expand();
      tg.MainButton.hide(); // Hide default blue button, we use our own UI
      
      // Parse URL params for stop list (passed from Python)
      const urlParams = new URLSearchParams(window.location.search);
      const stopListParam = urlParams.get('stop');
      if (stopListParam) {
        setStopList(stopListParam.split(',').map(Number).filter(n => !isNaN(n)));
      }
    }
  }, []);

  // Handlers
  const handleAddToCart = (item: MenuItem, options: SelectedOptions, finalPrice: number) => {
    let details = [];
    if (options.size) details.push(`${options.size.label}мл`);
    if (options.temp) details.push(`[${options.temp}]`);
    if (options.milk) details.push(`(${options.milk})`);
    if (options.syrup) details.push(`+${options.syrup}`);
    if (options.juice) details.push(`сок: ${options.juice}`);
    if (options.cinnamon) details.push(`+корица`);
    if (options.sugar) details.push(`сахар ${options.sugar}`);

    const detailString = details.length > 0 ? details.join(' ') : '';
    const fullName = `${item.name} ${detailString}`;

    setCart([...cart, {
      uid: Math.random().toString(36).substr(2, 9),
      id: item.id,
      name: fullName,
      baseName: item.name,
      price: finalPrice,
      details: detailString
    }]);
    setSelectedItem(null);
  };

  const handleRemoveFromCart = (uid: string) => {
    setCart(cart.filter(c => c.uid !== uid));
  };

  const handleCheckout = () => {
    if (!floor || !office) {
      tg.showAlert("Укажите этаж и офис!");
      return;
    }
    
    const payload = {
      type: 'order',
      items: cart.map(i => ({ label: i.name, amount: i.price * 100 })), // Amount in kopecks
      address: `Этаж ${floor}, Офис ${office}`
    };

    tg.sendData(JSON.stringify(payload));
  };

  const handleAdminToggle = (id: number) => {
    if (!isAdmin) return;
    if (stopList.includes(id)) {
      setStopList(stopList.filter(s => s !== id));
    } else {
      setStopList([...stopList, id]);
    }
  };

  const saveAdminChanges = () => {
    tg.sendData(JSON.stringify({ type: 'admin_sync', stop_list: stopList }));
  };

  const handleTitleTouchStart = () => {
    titleTouchRef.current.active = true;
    titleTouchRef.current.timer = setTimeout(() => {
      if (titleTouchRef.current.active) {
        const pass = prompt("Введите пароль администратора:");
        if (pass === "7654") {
          setIsAdmin(true);
          tg.showAlert("Режим администратора включен");
        }
      }
    }, 2000); // 2 second hold
  };

  const handleTitleTouchEnd = () => {
    titleTouchRef.current.active = false;
    if (titleTouchRef.current.timer) clearTimeout(titleTouchRef.current.timer);
  };

  return (
    <div className="min-h-screen pb-24 font-sans text-gray-900">
      
      {/* Header */}
      <header className="sticky top-0 bg-white/90 backdrop-blur-md z-40 border-b border-gray-100">
        <div 
          className="text-center py-4 select-none cursor-pointer"
          onMouseDown={handleTitleTouchStart}
          onMouseUp={handleTitleTouchEnd}
          onTouchStart={handleTitleTouchStart}
          onTouchEnd={handleTitleTouchEnd}
        >
          <h1 className="text-xl font-black tracking-tight flex items-center justify-center gap-2">
            URBAN LUNCH
            {isAdmin && <ShieldCheck size={18} className="text-blue-600" />}
          </h1>
        </div>

        {/* Categories */}
        <div className="flex overflow-x-auto gap-2 p-3 no-scrollbar snap-x">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-none px-5 py-2 rounded-full text-sm font-bold transition-all snap-start ${
                activeCategory === cat.id 
                  ? 'bg-black text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </header>

      {/* Grid */}
      <main className="p-3 grid grid-cols-2 gap-3">
        <AnimatePresence mode='popLayout'>
        {MENU_ITEMS
          .filter(item => item.cat === activeCategory)
          .map(item => {
            const isStopped = stopList.includes(item.id);
            if (isStopped && !isAdmin) return null; // Hide from users

            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: isStopped ? 0.6 : 1, scale: 1, filter: isStopped ? 'grayscale(100%)' : 'none' }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={item.id}
                onClick={() => isAdmin ? handleAdminToggle(item.id) : setSelectedItem(item)}
                className={`bg-white rounded-2xl p-3 shadow-sm border border-gray-100 relative overflow-hidden active:scale-[0.98] transition-transform duration-100 ${isStopped ? 'border-dashed border-red-300 bg-red-50' : ''}`}
              >
                {isAdmin && isStopped && (
                   <div className="absolute top-2 right-2 z-10 bg-red-500 text-white p-1 rounded-md">
                     <Lock size={12} />
                   </div>
                )}
                <div className="aspect-square bg-gray-100 rounded-xl mb-3 overflow-hidden relative">
                   <img 
                    src={IMG_BASE + item.img} 
                    alt={item.name} 
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/200?random=${item.id}` }}
                   />
                </div>
                <h3 className="font-bold text-sm leading-tight h-8 line-clamp-2 mb-1">{item.name}</h3>
                <p className="text-gray-500 text-xs font-semibold">
                  {item.price ? `${item.price} ₽` : item.sizes ? `от ${Object.values(item.sizes)[0]} ₽` : ''}
                </p>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </main>

      {/* Admin Floating Save Button */}
      {isAdmin && (
        <div className="fixed bottom-24 left-4 right-4 z-40">
           <button 
             onClick={saveAdminChanges}
             className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition"
           >
             <ShieldCheck size={20} />
             Сохранить Стоп-Лист
           </button>
        </div>
      )}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200 flex justify-around py-2 pb-6 z-40">
        <button 
          onClick={() => { setIsCartOpen(false); window.scrollTo({top:0, behavior:'smooth'}); }}
          className={`flex flex-col items-center gap-1 p-2 w-1/2 ${!isCartOpen ? 'text-black' : 'text-gray-400'}`}
        >
          <Coffee size={24} strokeWidth={2.5} />
          <span className="text-[10px] font-bold">Меню</span>
        </button>
        <button 
          onClick={() => setIsCartOpen(true)}
          className={`flex flex-col items-center gap-1 p-2 w-1/2 relative ${isCartOpen ? 'text-black' : 'text-gray-400'}`}
        >
          <div className="relative">
            <ShoppingCart size={24} strokeWidth={2.5} />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold">Корзина</span>
        </button>
      </nav>

      {/* Modals */}
      <AnimatePresence>
        {selectedItem && (
          <ProductModal 
            item={selectedItem} 
            onClose={() => setSelectedItem(null)} 
            onAdd={handleAddToCart} 
          />
        )}
      </AnimatePresence>

      {/* Cart Modal / Sheet */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/20 backdrop-blur-sm">
             <motion.div 
               initial={{ y: "100%" }}
               animate={{ y: 0 }}
               exit={{ y: "100%" }}
               transition={{ type: "spring", damping: 25, stiffness: 300 }}
               className="bg-white w-full h-[95vh] rounded-t-3xl shadow-2xl flex flex-col"
             >
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-3xl z-10">
                   <h2 className="text-xl font-bold">Ваш заказ</h2>
                   {cart.length > 0 && (
                     <button onClick={() => { if(confirm("Очистить корзину?")) setCart([]); }} className="text-red-500 text-xs font-bold bg-red-50 px-3 py-1 rounded-full">
                       Очистить
                     </button>
                   )}
                   <button onClick={() => setIsCartOpen(false)} className="p-2 bg-gray-100 rounded-full">
                     <X size={18} />
                   </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
                   {cart.length === 0 ? (
                     <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4 opacity-50">
                        <ShoppingCart size={64} />
                        <p>Корзина пуста</p>
                        <button onClick={() => setIsCartOpen(false)} className="text-blue-500 font-bold">Перейти в меню</button>
                     </div>
                   ) : (
                     cart.map((item) => (
                       <div key={item.uid} className="flex justify-between items-start border-b border-gray-50 pb-4 last:border-0">
                          <div className="flex-1">
                             <h4 className="font-bold text-sm">{item.baseName}</h4>
                             <p className="text-xs text-gray-500 leading-relaxed mt-1">{item.details}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2 ml-4">
                             <span className="font-bold text-sm whitespace-nowrap">{item.price} ₽</span>
                             <button onClick={() => handleRemoveFromCart(item.uid)} className="text-gray-300 hover:text-red-500 transition">
                               <Trash2 size={16} />
                             </button>
                          </div>
                       </div>
                     ))
                   )}
                </div>

                {cart.length > 0 && (
                  <div className="p-5 bg-gray-50 border-t border-gray-100 pb-10">
                    <div className="space-y-3 mb-5">
                       <input 
                         type="number" 
                         placeholder="Этаж" 
                         value={floor}
                         onChange={e => setFloor(e.target.value)}
                         className="w-full p-4 rounded-xl border border-gray-200 bg-white focus:border-black focus:ring-0 outline-none transition"
                       />
                       <input 
                         type="text" 
                         placeholder="Офис / Кабинет" 
                         value={office}
                         onChange={e => setOffice(e.target.value)}
                         className="w-full p-4 rounded-xl border border-gray-200 bg-white focus:border-black focus:ring-0 outline-none transition"
                       />
                    </div>
                    <div className="flex justify-between items-center mb-4 px-1">
                       <span className="text-gray-500">Итого:</span>
                       <span className="text-2xl font-black">{cart.reduce((sum, i) => sum + i.price, 0)} ₽</span>
                    </div>
                    <button 
                      onClick={handleCheckout}
                      className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg shadow-xl active:scale-[0.98] transition-transform"
                    >
                      Оплатить заказ
                    </button>
                  </div>
                )}
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
