import React, { useState, useEffect } from 'react';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ClassifyPage from './pages/ClassifyPage';
import HistoryPage from './pages/HistoryPage';
import DashboardPage from './pages/DashboardPage';
import { checkHealth } from './api/client';

export default function App() {
  const [activeTab, setActiveTab] = useState('classify');
  const [isServerOnline, setIsServerOnline] = useState(false);

  useEffect(() => {
    const verifyBackend = async () => {
      try {
        const res = await checkHealth();
        if (res && res.status === 'online') {
          setIsServerOnline(true);
        }
      } catch (err) {
        console.warn('Backend currently offline or starting up...');
        setIsServerOnline(false);
      }
    };

    verifyBackend();
    const interval = setInterval(verifyBackend, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7FAF7] text-[#183B2B] antialiased selection:bg-[#EAF5EC] selection:text-[#16845B]">
      {/* Light-theme Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isServerOnline={isServerOnline}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {activeTab === 'classify' && (
          <ClassifyPage onClassificationComplete={() => {}} />
        )}
        {activeTab === 'history' && <HistoryPage />}
        {activeTab === 'dashboard' && <DashboardPage />}
      </main>

      {/* Light-theme Footer */}
      <Footer />
    </div>
  );
}
