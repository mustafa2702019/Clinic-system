import { 
  Home, 
  Users, 
  Calendar, 
  TrendingUp, 
  Package,
  Stethoscope
} from 'lucide-react';
import type { ViewType } from '@/types';
import { cn } from '@/lib/utils';

interface SidebarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
}

const menuItems = [
  { id: 'dashboard' as ViewType, label: 'الرئيسية', icon: Home },
  { id: 'patients' as ViewType, label: 'المرضى', icon: Users },
  { id: 'appointments' as ViewType, label: 'المواعيد', icon: Calendar },
  { id: 'revenue' as ViewType, label: 'الإيرادات', icon: TrendingUp },
  { id: 'inventory' as ViewType, label: 'المخزون', icon: Package },
];

export function Sidebar({ currentView, onNavigate }: SidebarProps) {
  return (
    <aside className="fixed right-0 top-0 h-screen w-64 bg-white border-l border-gray-200 shadow-lg z-50 flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">ابتسامتي</h1>
            <p className="text-xs text-gray-500">نظام إدارة العيادات</p>
          </div>
        </div>
        
        {/* Branch Tags */}
        <div className="flex flex-wrap gap-1">
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">سمالوط</span>
          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">التوفيقية</span>
          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">قلوصنا</span>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <img 
              src="/assets/dr-ebram.jpg" 
              alt="د. إبراهيم عبد لمعى"
              className="w-12 h-12 rounded-full object-cover border-2 border-blue-200 shadow-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23e5e7eb"/><text x="50" y="55" text-anchor="middle" font-size="30" fill="%236b7280">د</text></svg>';
              }}
            />
            <div>
              <p className="text-sm font-medium text-gray-700">د. إبراهيم عبد لمعى</p>
              <p className="text-xs text-gray-500">مدير النظام</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-right",
                    isActive 
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md" 
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-gray-500")} />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4">
          <p className="text-xs text-gray-600 text-center">
            © 2026 ابتسامتي
          </p>
          <p className="text-xs text-gray-500 text-center mt-1">
            جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </aside>
  );
}
