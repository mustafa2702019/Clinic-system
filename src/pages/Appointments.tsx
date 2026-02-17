import { useState, useMemo } from 'react';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  User,
  MapPin,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAppointments, usePatients, branches } from '@/hooks/useData';
import type { Appointment } from '@/types';
import { toast } from 'sonner';

export function Appointments() {
  const { appointments, addAppointment, updateAppointment, getTodayAppointments } = useAppointments();
  const { patients } = usePatients();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [branchFilter, setBranchFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    patientId: '',
    branch: '',
    doctor: 'د. إبراهيم',
    date: '',
    time: '',
    notes: '',
  });

  const todayAppointments = getTodayAppointments();

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().split('T')[0];

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayAppointments = appointments.filter(apt => {
        const matchesDate = apt.date === dateStr;
        const matchesBranch = branchFilter === 'all' || apt.branch === branchFilter;
        return matchesDate && matchesBranch;
      });
      
      days.push({
        day,
        date: dateStr,
        appointments: dayAppointments,
        isToday: dateStr === today,
      });
    }
    
    return days;
  }, [year, month, firstDayOfMonth, daysInMonth, appointments, branchFilter, today]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleAddAppointment = () => {
    const patient = patients.find(p => p.id === Number(formData.patientId));
    if (!patient) return;

    addAppointment({
      patientId: patient.id,
      patientName: patient.name,
      branch: formData.branch,
      doctor: formData.doctor,
      date: formData.date,
      time: formData.time,
      status: 'pending',
      notes: formData.notes,
    });

    toast.success('تم إضافة الموعد بنجاح');
    setIsAddDialogOpen(false);
    setFormData({
      patientId: '',
      branch: '',
      doctor: 'د. إبراهيم',
      date: '',
      time: '',
      notes: '',
    });
  };

  const openAddDialog = (date?: string) => {
    setFormData({
      patientId: '',
      branch: '',
      doctor: 'د. إبراهيم',
      date: date || new Date().toISOString().split('T')[0],
      time: '',
      notes: '',
    });
    setIsAddDialogOpen(true);
  };

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500">مؤكد</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">معلق</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500">مكتمل</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">ملغي</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة المواعيد</h1>
          <p className="text-gray-500 mt-1">جدولة وإدارة مواعيد المرضى</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={branchFilter} onValueChange={setBranchFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="الفرع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الفروع</SelectItem>
              {branches.map(b => (
                <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className="bg-green-500 hover:bg-green-600" onClick={() => openAddDialog()}>
            <Plus className="w-4 h-4 ml-2" />
            موعد جديد
          </Button>
        </div>
      </div>

      {/* Calendar */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-500" />
              {currentDate.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' })}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrevMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleToday}>
                اليوم
              </Button>
              <Button variant="outline" size="sm" onClick={handleNextMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Week days header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((dayData, index) => (
              <div
                key={index}
                className={`
                  min-h-[100px] p-2 border rounded-lg transition-all
                  ${dayData ? 'bg-white hover:bg-gray-50 cursor-pointer' : 'bg-gray-50'}
                  ${dayData?.isToday ? 'border-blue-500 border-2' : 'border-gray-100'}
                `}
                onClick={() => dayData && openAddDialog(dayData.date)}
              >
                {dayData && (
                  <>
                    <div className={`text-sm font-medium mb-1 ${dayData.isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                      {dayData.day}
                    </div>
                    <div className="space-y-1">
                      {dayData.appointments.slice(0, 3).map((apt) => (
                        <div
                          key={apt.id}
                          className={`
                            text-xs p-1 rounded truncate
                            ${apt.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                              apt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              apt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                              'bg-blue-100 text-blue-700'}
                          `}
                        >
                          {apt.time} - {apt.patientName}
                        </div>
                      ))}
                      {dayData.appointments.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{dayData.appointments.length - 3} مواعيد أخرى
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Today's Appointments */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            مواعيد اليوم
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {todayAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>لا توجد مواعيد اليوم</p>
              </div>
            ) : (
              todayAppointments.map((apt) => (
                <div 
                  key={apt.id} 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold">
                        {apt.patientName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{apt.patientName}</p>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {apt.branch}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {apt.doctor}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-left">
                      <p className="font-bold text-gray-800">{apt.time}</p>
                      {getStatusBadge(apt.status)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-green-600"
                        onClick={() => updateAppointment(apt.id, { status: 'confirmed' })}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-600"
                        onClick={() => updateAppointment(apt.id, { status: 'cancelled' })}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Appointment Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>إضافة موعد جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>المريض *</Label>
              <Select 
                value={formData.patientId} 
                onValueChange={(v) => {
                  const patient = patients.find(p => p.id === Number(v));
                  setFormData({ 
                    ...formData, 
                    patientId: v,
                    branch: patient?.branch || formData.branch
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المريض" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map(p => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.name} - {p.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>الفرع *</Label>
                <Select 
                  value={formData.branch} 
                  onValueChange={(v) => setFormData({ ...formData, branch: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفرع" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map(b => (
                      <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>الطبيب *</Label>
                <Select 
                  value={formData.doctor} 
                  onValueChange={(v) => setFormData({ ...formData, doctor: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="د. إبراهيم">د. إبراهيم</SelectItem>
                    <SelectItem value="د. أحمد">د. أحمد</SelectItem>
                    <SelectItem value="د. محمد">د. محمد</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>التاريخ *</Label>
                <Input 
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>الوقت *</Label>
                <Input 
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>ملاحظات</Label>
              <Input 
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="أي ملاحظات إضافية..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                إلغاء
              </Button>
              <Button 
                className="bg-green-500 hover:bg-green-600"
                onClick={handleAddAppointment}
                disabled={!formData.patientId || !formData.branch || !formData.date || !formData.time}
              >
                حفظ الموعد
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
