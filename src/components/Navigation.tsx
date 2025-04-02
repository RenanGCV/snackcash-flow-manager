
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, DollarSign, Receipt } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/products', label: 'Produtos', icon: ShoppingBag },
    { path: '/sales', label: 'Vendas', icon: Receipt },
    { path: '/expenses', label: 'Despesas', icon: DollarSign },
  ];
  
  return (
    <nav className="w-64 bg-white border-r shadow-sm h-screen">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold text-snack flex items-center gap-2">
          <span className="text-snack-secondary">🥪</span> SnackCash
        </h1>
        <p className="text-xs text-muted-foreground">Gestão Simples para Lanchonetes</p>
      </div>
      
      <div className="p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                isActive 
                  ? 'bg-snack text-snack-foreground' 
                  : 'text-snack-dark hover:bg-snack-light'
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
