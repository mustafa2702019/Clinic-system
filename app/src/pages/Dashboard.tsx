import { useMemo } from 'react';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  AlertTriangle,
  TrendingUp,
  Clock,
  ChevronLeft
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePatients, useAppointments, useInventory, useTransactions, branches, formatCurrency, formatDate } from '@/hooks/useData';
import type { ViewType } from '@/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface DashboardProps {
  onNavigate: (view: ViewType) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { patients } = usePatients();
  const { getTodayAppointments } = useAppointments();
  const { getLowStockItems, getCriticalStockItems } = useInventory();
  const { transactions } = useTransactions();

  const todayAppointments = getTodayAppointments();
  const lowStockItems = getLowStockItems();
  const criticalItems = getCriticalStockItems();

  // Calculate stats
  const today = new Date().toISOString().split('T')[0];
  const todayRevenue = useMemo(() => {
    return transactions
      .filter(t => t.date === today && (t.type === 'كشف' || t.type === 'علاج'))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, today]);

  const todayPatients = useMemo(() => {
    return patients.filter(p => p.lastVisit === today).length;
  }, [patients, today]);

  // Chart data for daily revenue (last 7 days)
  const revenueChartData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayRevenue = transactions
        .filter(t => t.date === dateStr && (t.type === 'كشف' || t.type === 'علاج'))
        .reduce((sum, t) => sum + t.amount, 0);
      
      data.push({
        date: date.toLocaleDateString('ar-EG', { weekday: 'short' }),
        revenue: dayRevenue,
      });
    }
    return data;
  }, [transactions]);

  // Branch comparison data
  const branchData = useMemo(() => {
    return branches.map(branch => {
      const branchRevenue = transactions
        .filter(t => t.branch === branch.name && (t.type === 'كشف' || t.type === 'علاج'))
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        name: branch.name,
        revenue: branchRevenue,
      };
    });
  }, [transactions]);

  const stats = [
    {
      title: 'مرضى اليوم',
      value: todayPatients.toString(),
      icon: Users,
      color: 'bg-blue-500',
      trend: '+12%',
    },
    {
      title: 'مواعيد اليوم',
      value: todayAppointments.length.toString(),
      icon: Calendar,
      color: 'bg-purple-500',
      trend: '+5%',
    },
    {
      title: 'إيرادات اليوم',
      value: formatCurrency(todayRevenue),
      icon: DollarSign,
      color: 'bg-green-500',
      trend: '+8%',
    },
    {
      title: 'مواد منخفضة',
      value: lowStockItems.length.toString(),
      icon: AlertTriangle,
      color: criticalItems.length > 0 ? 'bg-red-500' : 'bg-yellow-500',
      alert: criticalItems.length > 0,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">لوحة التحكم الرئيسية</h1>
          <p className="text-gray-500 mt-1">نظرة عامة على أداء العيادات</p>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <Clock className="w-4 h-4" />
          <span>{formatDate(today)}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-800 mt-2">{stat.value}</p>
                    {stat.trend && (
                      <div className="flex items-center gap-1 mt-2">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-green-600">{stat.trend}</span>
                      </div>
                    )}
                  </div>
                  <div className={`${stat.color} p-3 rounded-xl`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">الإيرادات اليومية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#888" fontSize={12} />
                  <YAxis stroke="#888" fontSize={12} tickFormatter={(v) => `${v} ج`} />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'الإيرادات']}
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    fill="rgba(59, 130, 246, 0.1)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Branch Comparison */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">مقارنة أداء الفروع</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branchData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#888" fontSize={12} />
                  <YAxis stroke="#888" fontSize={12} tickFormatter={(v) => `${v} ج`} />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'الإيرادات']}
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts & Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts */}
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">التنبيهات</CardTitle>
            {lowStockItems.length > 0 && (
              <Badge variant="destructive" className="bg-red-500">
                {lowStockItems.length} تنبيه
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalItems.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-medium">مواد حرجة في المخزون</span>
                  </div>
                  <p className="text-sm text-red-600 mt-1">
                    {criticalItems.length} مواد تحتاج إعادة طلب فورية
                  </p>
                  <Button 
                    variant="link" 
                    className="text-red-700 p-0 h-auto mt-2"
                    onClick={() => onNavigate('inventory')}
                  >
                    عرض المخزون <ChevronLeft className="w-4 h-4 mr-1" />
                  </Button>
                </div>
              )}
              
              {lowStockItems.filter(i => i.quantity > 5).length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-yellow-700">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-medium">مواد منخفضة</span>
                  </div>
                  <p className="text-sm text-yellow-600 mt-1">
                    {lowStockItems.filter(i => i.quantity > 5).length} مواد وصلت للحد الأدنى
                  </p>
                </div>
              )}

              {lowStockItems.length === 0 && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <p className="text-green-700">لا توجد تنبيهات حالياً</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Today's Appointments */}
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">مواعيد اليوم</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onNavigate('appointments')}
            >
              عرض الكل <ChevronLeft className="w-4 h-4 mr-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayAppointments.length === 0 ? (
                <p className="text-center text-gray-500 py-4">لا توجد مواعيد اليوم</p>
              ) : (
                todayAppointments.slice(0, 5).map((apt) => (
                  <div 
                    key={apt.id} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {apt.patientName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{apt.patientName}</p>
                        <p className="text-sm text-gray-500">{apt.branch} - {apt.doctor}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <Badge 
                        variant={apt.status === 'confirmed' ? 'default' : 'secondary'}
                        className={apt.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'}
                      >
                        {apt.status === 'confirmed' ? 'مؤكد' : 'معلق'}
                      </Badge>
                      <p className="text-sm text-gray-500 mt-1">{apt.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
