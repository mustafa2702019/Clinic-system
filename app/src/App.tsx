import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/pages/Dashboard';
import { Patients } from '@/pages/Patients';
import { Appointments } from '@/pages/Appointments';
import { Revenue } from '@/pages/Revenue';
import { Inventory } from '@/pages/Inventory';
import type { ViewType } from '@/types';
import { Toaster } from '@/components/ui/sonner';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentView} />;
      case 'patients':
        return <Patients />;
      case 'appointments':
        return <Appointments />;
      case 'revenue':
        return <Revenue />;
      case 'inventory':
        return <Inventory />;
      default:
        return <Dashboard onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="flex">
        <Sidebar currentView={currentView} onNavigate={setCurrentView} />
        <main className="flex-1 mr-64 min-h-screen">
          {renderView()}
        </main>
      </div>
      <Toaster position="top-left" />
    </div>
  );
}

export default App;
