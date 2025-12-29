import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Utensils, ShoppingBasket } from 'lucide-react';
import { motion } from 'framer-motion';

const App = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Инициализация Telegram
        const tg = window.Telegram?.WebApp;
        if (tg) {
            tg.ready();
            tg.expand();
            setUser(tg.initDataUnsafe?.user);
        }
    }, []);

    return (
        <div className="min-h-screen p-4 flex flex-col items-center">
            <motion.header 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-full max-w-md bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-4"
            >
                <div className="flex items-center gap-4">
                    <div className="bg-orange-100 p-3 rounded-xl">
                        <Utensils className="text-orange-600 w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Urban Lunch</h1>
                        <p className="text-sm text-gray-500">
                            Привет, {user?.first_name || 'гость'}!
                        </p>
                    </div>
                </div>
            </motion.header>

            <main className="w-full max-w-md mt-6">
                <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
                    <ShoppingBasket className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-600">Ваше меню скоро появится здесь.</p>
                </div>
            </main>

            <footer className="fixed bottom-6 w-full max-w-md px-4">
                <button 
                    onClick={() => window.Telegram?.WebApp.showAlert('Корзина пока пуста')}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl transition-colors shadow-lg shadow-orange-200"
                >
                    Перейти к заказу
                </button>
            </footer>
        </div>
    );
};

// Рендеринг приложения
const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}
