import React, { useState, useEffect } from 'react';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import ClassifyPage from './pages/ClassifyPage';
import ChatPage from './pages/ChatPage';
import HistoryPage from './pages/HistoryPage';
import DashboardPage from './pages/DashboardPage';
import WasteGuidePage from './pages/WasteGuidePage';
import RecyclingLocatorPage from './pages/RecyclingLocatorPage';
import EcoChallengesPage from './pages/EcoChallengesPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import { AuthProvider } from './context/AuthContext';
import { checkHealth } from './api/client';

function AppContent() {
  const [activeTab, setActiveTab] = useState('home');
  const [isServerOnline, setIsServerOnline] = useState(false);

  useEffect(() => {
    const verifyBackend = async () => {
      try {
        const res = await checkHealth();
        if (res && res.status === 'online') {
          setIsServerOnline(true);
        }
      } catch (err) {
        setIsServerOnline(false);
      }
    };

    verifyBackend();
    const interval = setInterval(verifyBackend, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7FAF7] text-[#183B2B] antialiased selection:bg-[#EAF5EC] selection:text-[#16845B]">
      {/* Light-theme Responsive Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isServerOnline={isServerOnline}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {activeTab === 'home' && <HomePage onNavigate={setActiveTab} />}
        {activeTab === 'classify' && <ClassifyPage onClassificationComplete={() => {}} />}
        {activeTab === 'chat' && <ChatPage onNavigate={setActiveTab} />}
        {activeTab === 'guide' && <WasteGuidePage />}
        {activeTab === 'locator' && <RecyclingLocatorPage />}
        {activeTab === 'challenges' && <EcoChallengesPage onNavigate={setActiveTab} />}
        {activeTab === 'history' && <HistoryPage />}
        {activeTab === 'dashboard' && <DashboardPage onNavigate={setActiveTab} />}
        {activeTab === 'profile' && <ProfilePage onNavigate={setActiveTab} />}
        {activeTab === 'admin' && <AdminDashboardPage onNavigate={setActiveTab} />}
        {activeTab === 'login' && <LoginPage onNavigate={setActiveTab} />}
        {activeTab === 'register' && <RegisterPage onNavigate={setActiveTab} />}
        {activeTab === 'forgot-password' && <ForgotPasswordPage onNavigate={setActiveTab} />}
      </main>

      {/* Light-theme Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
