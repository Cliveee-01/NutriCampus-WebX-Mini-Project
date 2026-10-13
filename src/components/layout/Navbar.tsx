import React from 'react';
import { useNutriStore } from '../../hooks/useNutriStore';
import { useCartStore } from '../../services/cartStore';
import {
  Leaf,
  User,
  ShieldCheck,
  ArrowRightLeft,
  Menu as MenuIcon,
  X,
  ShoppingBag,
  Receipt,
} from 'lucide-react';

export type ActiveTab =
  | 'welcome'
  | 'student-overview'
  | 'daily-menu'
  | 'meal-rsvp'
  | 'flash-sale'
  | 'my-orders'
  | 'food-profile'
  | 'my-claims'
  | 'admin-overview'
  | 'admin-orders'
  | 'demand-forecast'
  | 'surplus-broadcast'
  | 'sustainability-analytics'
  | 'menu-management';

interface NavbarProps {
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenDocs: () => void;
  onOpenCart?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, onOpenCart }) => {
  const store = useNutriStore();
  const cart = useCartStore();
  const currentUser = store.getCurrentUser();
  const isAdmin = currentUser.role === 'admin';
  const claims = store.getClaimsForUser();
  const activeSurplusCount = store
    .getSurplusOffers()
    .filter((o) => o.status === 'active' && o.availableQuantity > 0).length;
  const cartItemCount = cart.getTotalItemsCount();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const toggleRole = () => {
    if (isAdmin) {
      store.switchUser('student-1');
      onSelectTab('student-overview');
    } else {
      store.switchUser('admin-1');
      onSelectTab('admin-overview');
    }
  };

  const navLinks = isAdmin
    ? [
        { id: 'admin-overview' as ActiveTab, label: 'Overview' },
        { id: 'admin-orders' as ActiveTab, label: 'Tray Orders' },
        { id: 'demand-forecast' as ActiveTab, label: 'Demand Forecast' },
        { id: 'surplus-broadcast' as ActiveTab, label: 'Surplus Broadcast' },
        { id: 'sustainability-analytics' as ActiveTab, label: 'Analytics' },
        { id: 'menu-management' as ActiveTab, label: 'Recipes & Menu' },
      ]
    : [
        { id: 'student-overview' as ActiveTab, label: 'Dashboard' },
        { id: 'daily-menu' as ActiveTab, label: 'Daily Menu' },
        { id: 'meal-rsvp' as ActiveTab, label: 'Meal RSVP' },
        { id: 'my-orders' as ActiveTab, label: 'My Orders & Receipts' },
        {
          id: 'flash-sale' as ActiveTab,
          label: `Flash Sale (${activeSurplusCount})`,
        },
        {
          id: 'my-claims' as ActiveTab,
          label: claims.length > 0 ? `My Claims (${claims.length})` : 'My Claims',
        },
        { id: 'food-profile' as ActiveTab, label: 'Food Profile' },
      ];

  const handleNavClick = (tab: ActiveTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 h-16">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onSelectTab(isAdmin ? 'admin-overview' : 'student-overview')}
          className="flex items-center gap-2 text-left cursor-pointer group shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-[#1C3B2B] flex items-center justify-center text-lime-400 group-hover:bg-[#27533c] transition-colors">
            <Leaf className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-slate-900 leading-tight">
              Nutri<span className="text-[#2E7D32]">Campus</span>
            </span>
            <span className="text-[10px] tracking-wider uppercase text-slate-400 font-semibold leading-none">
              Smart Mess & Waste Reducer
            </span>
          </div>
        </button>

        {/* Zone 2: Concise single-line navigation links */}
        <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-slate-600">
          {navLinks.map((link) => {
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`py-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'text-[#1C3B2B] font-semibold border-b-2 border-[#2E7D32]'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions, Tray/Cart button, Role switcher */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Student Quick Tray/Cart button */}
          {!isAdmin && onOpenCart && (
            <button
              onClick={onOpenCart}
              title="View my tray and checkout"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold transition-all cursor-pointer relative"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">Tray</span>
              {cartItemCount > 0 ? (
                <span className="bg-emerald-700 text-white rounded-full px-1.5 py-0.2 text-[10px] tabular-nums font-bold">
                  {cartItemCount}
                </span>
              ) : (
                <span className="text-slate-400 text-[10px]">(0)</span>
              )}
            </button>
          )}

          {/* User Role Tag */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 text-xs">
            {isAdmin ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                Admin Portal
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                <User className="w-3.5 h-3.5 text-emerald-700" />
                {currentUser.name.split(' ')[0]}
              </span>
            )}
          </div>

          {/* Role Switcher */}
          <button
            onClick={toggleRole}
            title={isAdmin ? 'Switch to Student View' : 'Switch to Canteen Admin View'}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-xs"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-lime-400" />
            <span>{isAdmin ? 'View as Student' : 'Admin Portal'}</span>
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
          <div className="text-xs text-slate-400 font-semibold px-2 pb-1">
            {isAdmin ? 'Canteen Admin Navigation' : 'Student Navigation'}
          </div>
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={`block w-full text-left px-3 py-2 text-sm rounded-md font-medium transition-colors cursor-pointer ${
                currentTab === link.id
                  ? 'bg-emerald-50 text-[#1C3B2B] font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 px-2">
            <span>
              Signed in as: <strong className="text-slate-800">{currentUser.name}</strong>
            </span>
            <button
              onClick={() => handleNavClick('welcome')}
              className="text-[#2E7D32] hover:underline cursor-pointer"
            >
              Landing Page
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
