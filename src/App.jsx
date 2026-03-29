import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { useEffect, useState } from 'react';
import { hasStoredKeys } from './lib/crypto';
import { seedDefaultQuestions } from './lib/db';
import { setupAutoSync } from './lib/sync';
import { initNotifications } from './lib/notifications';

import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import Survey from './pages/Survey';
import QuickAdd from './pages/QuickAdd';
import History from './pages/History';
import Settings from './pages/Settings';
import Decrypt from './pages/Decrypt';
import GasSetup from './pages/GasSetup';
import BottomNav from './components/BottomNav';
import Toast from './components/Toast';

function AppRoutes() {
  const [isSetup, setIsSetup] = useState(hasStoredKeys());
  const [toast, setToast] = useState(null);

  useEffect(() => {
    seedDefaultQuestions();
    setupAutoSync();
    initNotifications();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSetupComplete = () => {
    setIsSetup(true);
  };

  if (!isSetup) {
    return <Welcome onComplete={handleSetupComplete} />;
  }

  return (
    <>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Dashboard showToast={showToast} />} />
          <Route path="/survey" element={<Survey showToast={showToast} />} />
          <Route path="/quick-add" element={<QuickAdd showToast={showToast} />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings showToast={showToast} />} />
          <Route path="/decrypt" element={<Decrypt />} />
          <Route path="/gas-setup" element={<GasSetup />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <BottomNav />
      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </ThemeProvider>
  );
}
