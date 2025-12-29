import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { ShoppingCart } from 'lucide-react';

const App = () => {
    useEffect(() => {
        window.Telegram?.WebApp.ready();
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold text-orange-600">Urban Lunch</h1>
            <p>Ваше меню готово к работе!</p>
        </div>
    );
};

// Важный момент для работы через Babel в браузере:
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
