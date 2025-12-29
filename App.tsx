import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Coffee, X, Trash2, ShieldCheck, Lock, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MENU_ITEMS, CATEGORIES, IMG_BASE, MILKS, SYRUPS } from './constants.ts';
import { MenuItem, CartItem, SelectedOptions } from './types.ts';

declare global {
  interface Window {
    Telegram: {
      WebApp: any;
    };
  }
}

const tg = window.Telegram?.WebApp;

// --- Components ---

const ProductModal = ({ item, onClose, onAdd }: { item: MenuItem; onClose: () => void; onAdd: (item: MenuItem, options: SelectedOptions, price: number) => void }) => {
  const [options, setOptions] = useState<SelectedOptions>({
    size: null,
    milk: null,
    syrup: null,
    temp: null,
    sugar: null,
    cinnamon: false,
    juice: null
  });

  // Calculate dynamic price
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
  
  // Validation logic
  const isDrinks = item.cat === 'drinks' || item.cat === 'ice';
  const canAdd = (item.sizes ? !!options.size : true) && (isDrinks ? !!options.temp : true);

  const handleAdd = () => {
    if (!canAdd) {
      tg?.HapticFeedback.notificationOccurred('error');
      if (item.sizes && !options.size) tg?.showAlert("Выберите объем!");
      else if (isDrinks && !options.temp) tg?.showAlert("Выберите температуру!");
      return;
    }
    tg?.HapticFeedback.impactOccurred('light');
    onAdd(item, options, currentPrice);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center" onClick={onClose}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div 
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-md bg-white rounded-t-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Image */}
        <div className="relative h-48 w-full shrink-0">
            <img src={IMG_BASE + item.img} className="w-full h-full object-cover" onError={(e) => (e.target as HTMLImageElement).src = `https://placehold.co/400?text=${item.name}`} />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
            <button onClick={onClose} className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-full p-2 shadow-sm">
                <X size={20} className="text-gray-800" />
            </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-28 pt-2 overflow-y-auto no-scrollbar flex-1">
            <h2 className="text-2xl font-black text-gray-900 leading-tight mb-6">{item.name}</h2>

            <div className="space-y-6">
                {/* Temp */}
                {isDrinks && (
                    <div className="space-y-3">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Температура</span>
                        <div className="grid grid-cols-2 gap-3">
                            {['Теплый', 'Холодный'].map(t => (
                                <button key={t} onClick={() => setOptions({...options, temp: options.temp === t ? null : t as any})}
                                    className={`py-3 rounded-2xl font-semibold text-sm transition-all ${options.temp === t ? 'bg-gray-900 text-white shadow-lg scale-[1.02]' : 'bg-gray-100 text-gray-600'}`}>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Size */}
                {item.sizes && (
                    <div className="space-y-3">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Объем</span>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(item.sizes).map(([s, p]) => (
                                <button key={s} onClick={() => setOptions({...options, size: options.size?.label === s ? null : {label:s, price:p}})}
                                    className={`px-4 py-2 rounded-xl font-semibold text-sm border-2 transition-all ${options.size?.label === s ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-100 bg-white text-gray-700'}`}>
                                    {s} мл
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Dynamic Options */}
                {(() => {
                    const hideExtras = item.cat === 'food' || item.cat === 'drinks';
                    const showMilk = !hideExtras && !item.noMilk && item.cat !== 'tea' && item.cat !== 'punsh' && !item.isBumble;
                    const showSyrup = !hideExtras && !item.noSyrup && item.cat !== 'punsh';
                    const showJuice = item.isBumble;

                    return (
                        <>
                            {showMilk && (
                                <div className="space-y-3">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Молоко</span>
                                    <div className="flex flex-wrap gap-2">
                                        {MILKS.map(m => (
                                            <button key={m} onClick={() => setOptions({...options, milk: options.milk === m ? null : m})}
                                                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${options.milk === m ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'}`}>
                                                {m}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                             {showJuice && (
                                <div className="space-y-3">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Сок</span>
                                    <div className="flex gap-2">
                                        {['Апельсиновый', 'Вишневый'].map(j => (
                                            <button key={j} onClick={() => setOptions({...options, juice: options.juice === j ? null : j})}
                                                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${options.juice === j ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-600'}`}>
                                                {j}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {showSyrup && (
                                <div className="space-y-3">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Сироп</span>
                                    <div className="flex flex-wrap gap-2">
                                        {SYRUPS.map(s => (
                                            <button key={s} onClick={() => setOptions({...options, syrup: options.syrup === s ? null : s})}
                                                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${options.syrup === s ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600'}`}>
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {!hideExtras && (
                                <div className="space-y-3">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Дополнительно</span>
                                    <div className="flex flex-wrap gap-3">
                                        <button onClick={() => setOptions({...options, cinnamon: !options.cinnamon})}
                                            className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${options.cinnamon ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-600'}`}>
                                            Корица
                                        </button>
                                        <div className="w-[1px] bg-gray-200 h-8 mx-1"></div>
                                        {['5г', '10г', '15г'].map(s => (
                                            <button key={s} onClick={() => setOptions({...options, sugar: options.sugar === s ? null : s})}
                                                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${options.sugar === s ? 'border-gray-800 bg-gray-100 text-black' : 'border-gray-200 text-gray-600'}`}>
                                                Сахар {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )
                })()}
            </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-8">
            <button onClick={handleAdd} disabled={!canAdd} className={`w-full py-4 rounded-2xl font-bold text-lg flex justify-between px-6 transition-all ${canAdd ? 'bg-gray-900 text-white shadow-xl hover:scale-[1.01] active:scale-[0.98]' : 'bg-gray-200 text-gray-400'}`}>
                <span>Добавить</span>
                <span>{currentPrice} ₽</span>
            </button>
        </div>
      </motion.div>
    </div>
  );
};

const App: React.FC = () => {
  const [activeCat, setActiveCat] = useState(CATEGORIES[0].id);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stopList, setStopList] = useState<number[]>([]);
  
  // Checkout Form
  const [floor, setFloor] = useState('');
  const [office, setOffice] = useState('');

  // Admin Secrets
  const [tapCount, setTapCount] = useState(0);
  const tapTimer = useRef<any>(null);

  useEffect(() => {
    if (tg) {
        tg.ready();
        tg.expand();
        tg.MainButton.hide();
        // Load stoplist from URL
        const params = new URLSearchParams(window.location.search);
        const stopParam = params.get('stop');
        if (stopParam) setStopList(stopParam.split(',').map(Number));
    }
  }, []);

  const handleTitleTap = () => {
    setTapCount(prev => prev + 1);
    if (tapTimer.current) clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => setTapCount(0), 1000); // Reset if not fast enough

    if (tapCount + 1 >= 5) {
        const pwd = prompt("Пароль администратора:");
        if (pwd === "7654") {
            setIsAdmin(true);
            tg?.showAlert("Режим администратора включен ✅");
        }
        setTapCount(0);
    }
  };

  const addToCart = (item: MenuItem, options: SelectedOptions, price: number) => {
    const detailsArr = [];
    if(options.size) detailsArr.push(`${options.size.label}мл`);
    if(options.temp) detailsArr.push(options.temp);
    if(options.milk) detailsArr.push(options.milk);
    if(options.syrup) detailsArr.push(options.syrup);
    if(options.juice) detailsArr.push(options.juice);
    if(options.cinnamon) detailsArr.push("Корица");
    if(options.sugar) detailsArr.push(`Сахар ${options.sugar}`);

    const itemDetails = detailsArr.join(', ');
    const name = `${item.name} ${options.size ? options.size.label : ''}`;

    setCart([...cart, {
        uid: Math.random().toString(36),
        id: item.id,
        baseName: item.name,
        name: name,
        price,
        details: itemDetails
    }]);
    setSelectedItem(null);
  };

  const handleCheckout = () => {
    if(!floor || !office) return tg?.showAlert("Пожалуйста, укажите Этаж и Офис");
    const payload = {
        type: 'order',
        items: cart.map(i => ({ label: i.name + (i.details ? ` (${i.details})` : ''), amount: i.price * 100 })),
        address: `Этаж ${floor}, Офис ${office}`
    };
    tg?.sendData(JSON.stringify(payload));
  };

  const handleAdminStop = (id: number) => {
    if(stopList.includes(id)) setStopList(stopList.filter(s => s !== id));
    else setStopList([...stopList, id]);
  };

  const saveAdmin = () => {
    tg?.sendData(JSON.stringify({ type: 'admin_sync', stop_list: stopList }));
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] pb-24 select-none">
      
      {/* Navbar */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md z-40 pt-safe-top">
        <div className="flex items-center justify-center h-14" onClick={handleTitleTap}>
             <h1 className="font-black text-lg tracking-tight flex items-center gap-2">
                URBAN LUNCH
                {isAdmin && <ShieldCheck size={16} className="text-blue-500"/>}
             </h1>
        </div>
        
        {/* Categories Scroller */}
        <div className="flex overflow-x-auto px-4 gap-3 pb-3 no-scrollbar snap-x">
            {CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => setActiveCat(cat.id)}
                    className={`flex-none px-5 py-2.5 rounded-full text-[13px] font-bold transition-all snap-start ${activeCat === cat.id ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-500 shadow-sm'}`}>
                    {cat.label}
                </button>
            ))}
        </div>
      </div>

      {/* Grid */}
      <div className="p-4 grid grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
            {MENU_ITEMS.filter(i => i.cat === activeCat).map(item => {
                const isStopped = stopList.includes(item.id);
                if(isStopped && !isAdmin) return null;

                return (
                    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: isStopped ? 0.5 : 1, scale: 1, filter: isStopped ? 'grayscale(1)' : 'none' }} exit={{ opacity: 0, scale: 0.95 }}
                        key={item.id}
                        onClick={() => isAdmin ? handleAdminStop(item.id) : setSelectedItem(item)}
                        className={`bg-white rounded-[20px] p-3 shadow-sm flex flex-col gap-3 active:scale-[0.97] transition-transform relative ${isStopped ? 'border-2 border-red-500' : ''}`}
                    >
                        {isAdmin && isStopped && <div className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-md z-10"><Lock size={12}/></div>}
                        <div className="aspect-square rounded-2xl bg-gray-100 overflow-hidden">
                            <img src={IMG_BASE + item.img} className="w-full h-full object-cover" loading="lazy" onError={(e) => (e.target as HTMLImageElement).src = `https://placehold.co/200?text=${item.name}`}/>
                        </div>
                        <div>
                            <div className="font-bold text-sm leading-tight line-clamp-2 h-9">{item.name}</div>
                            <div className="text-gray-400 font-semibold text-xs mt-1">
                                {item.price ? `${item.price} ₽` : item.sizes ? `от ${Object.values(item.sizes)[0]} ₽` : ''}
                            </div>
                        </div>
                    </motion.div>
                )
            })}
        </AnimatePresence>
      </div>

      {/* Admin Save Button */}
      {isAdmin && (
        <div className="fixed bottom-24 inset-x-4 z-40">
            <button onClick={saveAdmin} className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/30 active:scale-95 transition flex items-center justify-center gap-2">
                <ShieldCheck size={20}/>
                Сохранить изменения
            </button>
        </div>
      )}

      {/* Bottom Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-white/80 backdrop-blur-xl border-t border-gray-200 z-50 flex justify-around pb-safe-bottom">
        <button onClick={() => {setIsCartOpen(false); window.scrollTo({top:0,behavior:'smooth'})}} className={`flex-1 flex flex-col items-center py-2 gap-1 ${!isCartOpen ? 'text-gray-900' : 'text-gray-400'}`}>
            <Coffee size={24} strokeWidth={!isCartOpen ? 2.5 : 2}/>
            <span className="text-[10px] font-bold">Меню</span>
        </button>
        <button onClick={() => setIsCartOpen(true)} className={`flex-1 flex flex-col items-center py-2 gap-1 ${isCartOpen ? 'text-gray-900' : 'text-gray-400'}`}>
            <div className="relative">
                <ShoppingCart size={24} strokeWidth={isCartOpen ? 2.5 : 2}/>
                {cart.length > 0 && <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center">{cart.length}</span>}
            </div>
            <span className="text-[10px] font-bold">Корзина</span>
        </button>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {selectedItem && <ProductModal item={selectedItem} onClose={() => setSelectedItem(null)} onAdd={addToCart} />}
      </AnimatePresence>

      <AnimatePresence>
        {isCartOpen && (
            <div className="fixed inset-0 z-50 flex items-end justify-center">
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setIsCartOpen(false)} className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
                <motion.div initial={{y:"100%"}} animate={{y:0}} exit={{y:"100%"}} transition={{type:"spring", damping:25, stiffness:300}} className="bg-white w-full h-[92vh] rounded-t-[32px] flex flex-col z-10 shadow-2xl">
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-2xl font-black">Корзина</h2>
                        {cart.length > 0 && <button onClick={() => setCart([])} className="bg-red-50 text-red-500 text-xs font-bold px-3 py-1.5 rounded-full">Очистить</button>}
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-4">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center"><ShoppingCart size={32}/></div>
                                <span className="font-medium">Корзина пуста</span>
                            </div>
                        ) : (
                            cart.map(c => (
                                <div key={c.uid} className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="font-bold text-sm">{c.baseName}</div>
                                        <div className="text-xs text-gray-500 leading-relaxed mt-0.5">{c.details}</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-sm">{c.price} ₽</span>
                                        <button onClick={() => setCart(cart.filter(x => x.uid !== c.uid))} className="text-gray-300 hover:text-red-500"><Trash2 size={18}/></button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {cart.length > 0 && (
                        <div className="p-5 bg-gray-50 pb-safe-bottom">
                            <div className="space-y-3 mb-4">
                                <input type="number" placeholder="Этаж" value={floor} onChange={e=>setFloor(e.target.value)} className="w-full p-4 rounded-xl border-none shadow-sm focus:ring-2 ring-gray-900 bg-white font-medium"/>
                                <input type="text" placeholder="Офис / Кабинет" value={office} onChange={e=>setOffice(e.target.value)} className="w-full p-4 rounded-xl border-none shadow-sm focus:ring-2 ring-gray-900 bg-white font-medium"/>
                            </div>
                            <button onClick={handleCheckout} className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl flex justify-between px-6 shadow-xl active:scale-[0.98] transition">
                                <span>К оплате</span>
                                <span>{cart.reduce((a,b)=>a+b.price,0)} ₽</span>
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
