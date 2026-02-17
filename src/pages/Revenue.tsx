import { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  FileSpreadsheet,
  Building2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTransactions, branches, formatCurrency, formatDate } from '@/hooks/useData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';

type PeriodType = 'day' | 'week' | 'month' | 'year' | 'custom';

export function Revenue() {
  const { transactions } = useTransactions();
  const [period, setPeriod] = useState<PeriodType>('week');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Calculate date range
  const dateRange = useMemo(() => {
    const today = new Date();
    let start: Date;
    let end: Date = today;

    switch (period) {
      case 'day':
        start = today;
        break;
      case 'week':
        start = new Date(today);
        start.setDate(today.getDate() - 7);
        break;
      case 'month':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'year':
        start = new Date(today.getFullYear(), 0, 1);
        end = new Date(today.getFullYear(), 11, 31);
        break;
      case 'custom':
        start = customStartDate ? new Date(customStartDate) : today;
        end = customEndDate ? new Date(customEndDate) : today;
        break;
      default:
        start = today;
    }

    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    return { start: startStr, end: endStr };
  }, [period, customStartDate, customEndDate]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => t.date >= dateRange.start && t.date <= dateRange.end);
  }, [transactions, dateRange]);

  // Calculate totals
  const totals = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'كشف' || t.type === 'علاج')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = filteredTransactions
      .filter(t => t.type === 'مصروف')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const profit = income - expenses;

    return { income, expenses, profit };
  }, [filteredTransactions]);

  // Daily revenue chart data
  const dailyRevenueData = useMemo(() => {
    const dailyData: Record<string, number> = {};
    
    // Initialize all dates in range
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dailyData[d.toISOString().split('T')[0]] = 0;
    }

    // Add revenue data
    filteredTransactions
      .filter(t => t.type === 'كشف' || t.type === 'علاج')
      .forEach(t => {
        if (dailyData[t.date] !== undefined) {
          dailyData[t.date] += t.amount;
        }
      });

    return Object.entries(dailyData).map(([date, revenue]) => ({
      date: new Date(date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' }),
      revenue,
    }));
  }, [filteredTransactions, dateRange]);

  // Branch revenue data
  const branchData = useMemo(() => {
    return branches.map(branch => {
      const revenue = filteredTransactions
        .filter(t => t.branch === branch.name && (t.type === 'كشف' || t.type === 'علاج'))
        .reduce((sum, t) => sum + t.amount, 0);
      return { name: branch.name, value: revenue };
    }).filter(b => b.value > 0);
  }, [filteredTransactions]);

  const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444'];

  // Recent transactions
  const recentTransactions = useMemo(() => {
    return [...filteredTransactions]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 10);
  }, [filteredTransactions]);

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['التاريخ', 'المريض', 'الفرع', 'النوع', 'المبلغ', 'طريقة الدفع'];
    const rows = filteredTransactions.map(t => [
      t.date,
      t.patientName,
      t.branch,
      t.type,
      t.amount,
      t.paymentMethod,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `revenue_${dateRange.start}_to_${dateRange.end}.csv`;
    link.click();

    toast.success('تم تصدير التقرير بنجاح');
  };

  const getPeriodLabel = () => {
    switch (period) {
      case 'day': return 'اليوم';
      case 'week': return 'آخر 7 أيام';
      case 'month': return 'هذا الشهر';
      case 'year': return 'هذا العام';
      case 'custom': return 'مخصص';
      default: return '';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">الإيرادات والمصروفات</h1>
          <p className="text-gray-500 mt-1">تتبع وتحليل الإيرادات والمصروفات</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={(v) => setPeriod(v as PeriodType)}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="w-4 h-4 ml-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">اليوم</SelectItem>
              <SelectItem value="week">هذا الأسبوع</SelectItem>
              <SelectItem value="month">هذا الشهر</SelectItem>
              <SelectItem value="year">هذا العام</SelectItem>
              <SelectItem value="custom">مخصص</SelectItem>
            </SelectContent>
          </Select>
          
          {period === 'custom' && (
            <>
              <Input 
                type="date" 
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-[140px]"
              />
              <span className="text-gray-500">إلى</span>
              <Input 
                type="date" 
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-[140px]"
              />
            </>
          )}
          
          <Button variant="outline" onClick={exportToCSV}>
            <FileSpreadsheet className="w-4 h-4 ml-2" />
            تصدير Excel
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-md border-b-4 border-b-green-500">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">إجمالي الإيرادات</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{formatCurrency(totals.income)}</p>
                <p className="text-xs text-gray-400 mt-1">{getPeriodLabel()}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md border-b-4 border-b-red-500">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">إجمالي المصروفات</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{formatCurrency(totals.expenses)}</p>
                <p className="text-xs text-gray-400 mt-1">{getPeriodLabel()}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-xl">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md border-b-4 border-b-blue-500">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">صافي الربح</p>
                <p className={`text-3xl font-bold mt-2 ${totals.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(totals.profit)}
                </p>
                <p className="text-xs text-gray-400 mt-1">{getPeriodLabel()}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">الإيرادات اليومية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyRevenueData}>
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
                    stroke="#22c55e" 
                    strokeWidth={3}
                    dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Branch Distribution */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">توزيع الإيرادات حسب الفرع</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={branchData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {branchData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {branchData.map((branch, index) => (
                <div key={branch.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-gray-600">{branch.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Branch Performance */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-500" />
            أداء الفروع
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">الفرع</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">الإيرادات</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">المصروفات</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">صافي الربح</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">نسبة الأداء</th>
                </tr>
              </thead>
              <tbody>
                {branches.map((branch) => {
                  const income = filteredTransactions
                    .filter(t => t.branch === branch.name && (t.type === 'كشف' || t.type === 'علاج'))
                    .reduce((sum, t) => sum + t.amount, 0);
                  const expenses = filteredTransactions
                    .filter(t => t.branch === branch.name && t.type === 'مصروف')
                    .reduce((sum, t) => sum + t.amount, 0);
                  const profit = income - expenses;
                  const maxIncome = Math.max(...branches.map(b => 
                    filteredTransactions
                      .filter(t => t.branch === b.name && (t.type === 'كشف' || t.type === 'علاج'))
                      .reduce((sum, t) => sum + t.amount, 0)
                  ));
                  const performance = maxIncome > 0 ? (income / maxIncome) * 100 : 0;

                  return (
                    <tr key={branch.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{branch.name}</td>
                      <td className="px-4 py-3 text-green-600">{formatCurrency(income)}</td>
                      <td className="px-4 py-3 text-red-600">{formatCurrency(expenses)}</td>
                      <td className={`px-4 py-3 font-medium ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(profit)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${performance}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 mt-1">{performance.toFixed(0)}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">آخر المعاملات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTransactions.length === 0 ? (
              <p className="text-center text-gray-500 py-4">لا توجد معاملات</p>
            ) : (
              recentTransactions.map((t) => (
                <div 
                  key={t.id} 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      t.type === 'مصروف' ? 'bg-red-100' : 'bg-green-100'
                    }`}>
                      {t.type === 'مصروف' ? (
                        <TrendingDown className="w-5 h-5 text-red-600" />
                      ) : (
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{t.patientName}</p>
                      <p className="text-sm text-gray-500">
                        {t.branch} - {formatDate(t.date)} - {t.type}
                      </p>
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${t.type === 'مصروف' ? 'text-red-600' : 'text-green-600'}`}>
                    {t.type === 'مصروف' ? '-' : '+'}{formatCurrency(t.amount)}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Missing import
import { Input } from '@/components/ui/input';
