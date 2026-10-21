import React, { useState } from 'react';
import {
  Leaf,
  Camera,
  History,
  BarChart3,
  BookOpen,
  MapPin,
  Trophy,
  ShieldCheck,
  User,
  LogIn,
  LogOut,
  Menu,
  X,
  Sparkles,
  MessageCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ activeTab, setActiveTab, isServerOnline }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAdmin, logout } = useAuth();

  const navItems = [
    { id: 'home', label: 'Home', icon: Leaf },
    { id: 'classify', label: 'Classify', icon: Camera },
    { id: 'chat', label: 'Chat with AI', icon: MessageCircle },
    { id: 'guide', label: 'Disposal Guide', icon: BookOpen },
    { id: 'locator', label: 'Center Locator', icon: MapPin },
    { id: 'challenges', label: 'Eco-Points', icon: Trophy },
    { id: 'history', label: 'History', icon: History },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  ];

  if (isAdmin) {
    navItems.push({ id: 'admin', label: 'Admin', icon: ShieldCheck });
  }

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FFFFFF] border-b border-[#D3EAD7] shadow-[0_2px_10px_-2px_rgba(22,132,91,0.06)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#EAF5EC] border border-[#D3EAD7] flex items-center justify-center text-[#16845B] group-hover:scale-105 transition-transform duration-200 shadow-xs">
              <Leaf className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-tight text-[#183B2B]">
                  AI Waste<span className="text-[#16845B]">Wise</span>
                </span>
                <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.2 rounded-md bg-[#EAF5EC] text-[#16845B] border border-[#D3EAD7]">
                  90.6%
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                    isActive
                      ? 'bg-[#EAF5EC] text-[#16845B] border border-[#D3EAD7] shadow-xs'
                      : 'text-[#52705F] hover:text-[#183B2B] hover:bg-[#F7FAF7]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#16845B]' : 'text-[#52705F]'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons: Online Status & User Dropdown */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Server Status Indicator */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                isServerOnline
                  ? 'bg-[#EAF5EC] text-[#16845B] border-[#D3EAD7]'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isServerOnline ? 'bg-[#16845B] animate-pulse' : 'bg-amber-500'
                }`}
              />
              {isServerOnline ? 'AI Ready' : 'Connecting...'}
            </div>

            {/* Auth Button or User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-[#EAF5EC] border border-[#D3EAD7] transition"
                >
                  <div className="w-7 h-7 rounded-xl bg-[#16845B] text-white flex items-center justify-center font-bold text-xs">
                    {(user.full_name || user.email)[0].toUpperCase()}
                  </div>
                  <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#EAF5EC] text-[11px] font-black text-[#16845B]">
                    <Sparkles className="w-3 h-3" />
                    <span>{user.eco_points || 0} pts</span>
                  </div>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-[#FFFFFF] border border-[#D3EAD7] shadow-modal py-2 z-50 text-xs animate-in fade-in">
                    <div className="px-4 py-2 border-b border-[#F2F9F3]">
                      <p className="font-bold text-[#183B2B] truncate">{user.full_name || 'User'}</p>
                      <p className="text-[10px] text-[#52705F] truncate">{user.email}</p>
                    </div>

                    <button
                      onClick={() => handleNavClick('profile')}
                      className="w-full px-4 py-2 text-left font-semibold text-[#183B2B] hover:bg-[#EAF5EC] flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5 text-[#16845B]" />
                      Profile & Settings
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => handleNavClick('admin')}
                        className="w-full px-4 py-2 text-left font-semibold text-purple-700 hover:bg-purple-50 flex items-center gap-2"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                        Admin Dashboard
                      </button>
                    )}

                    <div className="border-t border-[#F2F9F3] my-1" />

                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleNavClick('login')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#EAF5EC] hover:bg-[#D3EAD7] text-[#16845B] transition flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </button>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[#183B2B] hover:bg-[#EAF5EC] focus:outline-none transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#FFFFFF] border-b border-[#D3EAD7] px-4 pt-2 pb-4 space-y-1 shadow-lg animate-in fade-in">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-left transition-colors ${
                  isActive
                    ? 'bg-[#EAF5EC] text-[#16845B] border border-[#D3EAD7]'
                    : 'text-[#52705F] hover:bg-[#F7FAF7] hover:text-[#183B2B]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#16845B]' : 'text-[#52705F]'}`} />
                {item.label}
              </button>
            );
          })}

          <div className="pt-2 border-t border-[#F2F9F3]">
            {user ? (
              <button
                onClick={() => handleNavClick('profile')}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold text-[#183B2B] bg-[#F7FAF7]"
              >
                <span>{user.email}</span>
                <span className="text-[#16845B] font-black">+{user.eco_points} pts</span>
              </button>
            ) : (
              <button
                onClick={() => handleNavClick('login')}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#16845B] text-white text-center"
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
