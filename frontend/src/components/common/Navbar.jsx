import React, { useState } from 'react';
import { Leaf, History, BarChart3, Camera, Menu, X, CheckCircle2 } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, isServerOnline }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'classify', label: 'Classify Waste', icon: Camera },
    { id: 'history', label: 'Prediction History', icon: History },
    { id: 'dashboard', label: 'Analytics Dashboard', icon: BarChart3 },
  ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FFFFFF] border-b border-[#D3EAD7] shadow-[0_2px_10px_-2px_rgba(22,132,91,0.06)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div 
            onClick={() => handleNavClick('classify')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#EAF5EC] border border-[#D3EAD7] flex items-center justify-center text-[#16845B] group-hover:scale-105 transition-transform duration-200 shadow-sm">
              <Leaf className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-[#183B2B]">
                  AI Waste<span className="text-[#16845B]">Wise</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#EAF5EC] text-[#16845B] border border-[#D3EAD7]">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] font-medium text-[#52705F] hidden sm:block">
                Smart Segregation & Management System
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-[#EAF5EC] text-[#16845B] shadow-sm border border-[#D3EAD7]'
                      : 'text-[#52705F] hover:text-[#183B2B] hover:bg-[#F7FAF7]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#16845B]' : 'text-[#52705F]'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* System Status Pill & Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              isServerOnline
                ? 'bg-[#EAF5EC] text-[#16845B] border-[#D3EAD7]'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isServerOnline ? 'bg-[#16845B] animate-pulse' : 'bg-amber-500'}`} />
              {isServerOnline ? 'AI Model Online' : 'Connecting API...'}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[#183B2B] hover:bg-[#EAF5EC] focus:outline-none transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#FFFFFF] border-b border-[#D3EAD7] px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-left transition-colors ${
                  isActive
                    ? 'bg-[#EAF5EC] text-[#16845B] border border-[#D3EAD7]'
                    : 'text-[#52705F] hover:bg-[#F7FAF7] hover:text-[#183B2B]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#16845B]' : 'text-[#52705F]'}`} />
                {item.label}
              </button>
            );
          })}
          <div className="pt-2">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border ${
              isServerOnline
                ? 'bg-[#EAF5EC] text-[#16845B] border-[#D3EAD7]'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isServerOnline ? 'bg-[#16845B]' : 'bg-amber-500'}`} />
              {isServerOnline ? 'AI Backend Online (MobileNetV3)' : 'Connecting to API...'}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
