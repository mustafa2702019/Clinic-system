import { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  DollarSign, 
  Filter,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePatients, useTransactions, branches, formatCurrency, formatDate } from '@/hooks/useData';
import type { Patient } from '@/types';
import { toast } from 'sonner';

export function Patients() {
  const { patients, addPatient, updatePatient, addPayment } = usePatients();
  const { addTransaction } = useTransactions();
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    birthDate: '',
    branch: '',
    doctor: 'د. إبراهيم',
    treatment: '',
    treatmentCost: 0,
    amountPaid: 0,
  });

  const [paymentData, setPaymentData] = useState({
    amount: 0,
    method: 'نقدي' as 'نقدي' | 'فيزا' | 'تحويل بنكي',
  });

  // Filter patients
  const filteredPatients = useMemo(() => {
    return patients.filter(patient => {
      const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm);
      const matchesBranch = branchFilter === 'all' || patient.branch === branchFilter;
      const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
      return matchesSearch && matchesBranch && matchesStatus;
    });
  }, [patients, searchTerm, branchFilter, statusFilter]);

  const handleAddPatient = () => {
    const newPatient = addPatient({
      ...formData,
      totalPayments: formData.amountPaid,
      pendingPayment: formData.treatmentCost - formData.amountPaid,
      status: 'active',
    });

    // Add transaction if payment made
    if (formData.amountPaid > 0) {
      addTransaction({
        patientId: newPatient.id,
        patientName: formData.name,
        amount: formData.amountPaid,
        type: 'كشف',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'نقدي',
        branch: formData.branch,
      });
    }

    toast.success('تم إضافة المريض بنجاح');
    setIsAddDialogOpen(false);
    setFormData({
      name: '',
      phone: '',
      birthDate: '',
      branch: '',
      doctor: 'د. إبراهيم',
      treatment: '',
      treatmentCost: 0,
      amountPaid: 0,
    });
  };

  const handleUpdatePatient = () => {
    if (!editingPatient) return;
    
    updatePatient(editingPatient.id, {
      ...formData,
      pendingPayment: formData.treatmentCost - formData.amountPaid,
    });

    toast.success('تم تحديث بيانات المريض بنجاح');
    setIsAddDialogOpen(false);
    setEditingPatient(null);
  };

  const handleAddPayment = () => {
    if (!selectedPatient) return;

    addPayment(selectedPatient.id, paymentData.amount, paymentData.method);
    
    addTransaction({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      amount: paymentData.amount,
      type: 'علاج',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: paymentData.method,
      branch: selectedPatient.branch,
    });

    toast.success('تم تسجيل الدفعة بنجاح');
    setIsPaymentDialogOpen(false);
    setPaymentData({ amount: 0, method: 'نقدي' });
  };

  const openEditDialog = (patient: Patient) => {
    setEditingPatient(patient);
    setFormData({
      name: patient.name,
      phone: patient.phone,
      birthDate: patient.birthDate || '',
      branch: patient.branch,
      doctor: patient.doctor,
      treatment: patient.treatment || '',
      treatmentCost: patient.treatmentCost,
      amountPaid: patient.totalPayments,
    });
    setIsAddDialogOpen(true);
  };

  const openViewDialog = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsViewDialogOpen(true);
  };

  const openPaymentDialog = (patient: Patient) => {
    setSelectedPatient(patient);
    setPaymentData({ amount: 0, method: 'نقدي' });
    setIsPaymentDialogOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة المرضى</h1>
          <p className="text-gray-500 mt-1">إدارة بيانات المرضى والمدفوعات</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-green-500 hover:bg-green-600"
              onClick={() => {
                setEditingPatient(null);
                setFormData({
                  name: '',
                  phone: '',
                  birthDate: '',
                  branch: '',
                  doctor: 'د. إبراهيم',
                  treatment: '',
                  treatmentCost: 0,
                  amountPaid: 0,
                });
              }}
            >
              <Plus className="w-4 h-4 ml-2" />
              إضافة مريض جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPatient ? 'تعديل بيانات المريض' : 'إضافة مريض جديد'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>اسم المريض *</Label>
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="أدخل اسم المريض"
                  />
                </div>
                <div className="space-y-2">
                  <Label>رقم الهاتف *</Label>
                  <Input 
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="01XXXXXXXXX"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>تاريخ الميلاد</Label>
                  <Input 
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  />
                </div>
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
              </div>

              <div className="space-y-2">
                <Label>الطبيب المعالج</Label>
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

              <div className="space-y-2">
                <Label>نوع العلاج</Label>
                <Input 
                  value={formData.treatment}
                  onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                  placeholder="وصف العلاج المطلوب"
                />
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-green-600 mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  معلومات الدفع
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>تكلفة العلاج</Label>
                    <Input 
                      type="number"
                      value={formData.treatmentCost}
                      onChange={(e) => setFormData({ ...formData, treatmentCost: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>المدفوع {editingPatient && '(إجمالي)'}</Label>
                    <Input 
                      type="number"
                      value={formData.amountPaid}
                      onChange={(e) => setFormData({ ...formData, amountPaid: Number(e.target.value) })}
                      readOnly={!!editingPatient}
                    />
                  </div>
                </div>
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm">
                    المتبقي: <span className="font-bold text-red-600">
                      {formatCurrency(formData.treatmentCost - formData.amountPaid)}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button 
                  className="bg-green-500 hover:bg-green-600"
                  onClick={editingPatient ? handleUpdatePatient : handleAddPatient}
                >
                  {editingPatient ? 'حفظ التغييرات' : 'إضافة مريض'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[250px] relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="ابحث بالاسم أو رقم الهاتف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 ml-2" />
                <SelectValue placeholder="الفرع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفروع</SelectItem>
                {branches.map(b => (
                  <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Patients Table */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">#</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">اسم المريض</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">رقم الهاتف</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">الفرع</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">آخر زيارة</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">المدفوعات</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">المتبقي</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">الحالة</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient, index) => (
                  <tr key={patient.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 text-sm font-medium">
                            {patient.name.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium">{patient.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{patient.phone}</td>
                    <td className="px-4 py-3 text-sm">{patient.branch}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {patient.lastVisit ? formatDate(patient.lastVisit) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-green-600">
                      {formatCurrency(patient.totalPayments)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={patient.pendingPayment > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                        {formatCurrency(patient.pendingPayment)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge 
                        variant={patient.status === 'active' ? 'default' : 'secondary'}
                        className={patient.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}
                      >
                        {patient.status === 'active' ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-blue-500"
                          onClick={() => openViewDialog(patient)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-amber-500"
                          onClick={() => openEditDialog(patient)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-green-500"
                          onClick={() => openPaymentDialog(patient)}
                        >
                          <DollarSign className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredPatients.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              لا يوجد مرضى مطابقين للبحث
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Patient Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>بيانات المريض</DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="info">المعلومات</TabsTrigger>
                <TabsTrigger value="payments">سجل المدفوعات</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">الاسم:</span>
                    <span className="font-medium">{selectedPatient.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">رقم الهاتف:</span>
                    <span className="font-medium">{selectedPatient.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">تاريخ الميلاد:</span>
                    <span className="font-medium">{selectedPatient.birthDate || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">الفرع:</span>
                    <span className="font-medium">{selectedPatient.branch}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">الطبيب:</span>
                    <span className="font-medium">{selectedPatient.doctor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">العلاج:</span>
                    <span className="font-medium">{selectedPatient.treatment || '-'}</span>
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">تكلفة العلاج:</span>
                      <span className="font-medium">{formatCurrency(selectedPatient.treatmentCost)}</span>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-gray-500">إجمالي المدفوعات:</span>
                      <span className="font-medium text-green-600">{formatCurrency(selectedPatient.totalPayments)}</span>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-gray-500">المتبقي:</span>
                      <span className={`font-medium ${selectedPatient.pendingPayment > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(selectedPatient.pendingPayment)}
                      </span>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="payments">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedPatient.payments.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">لا توجد مدفوعات</p>
                  ) : (
                    selectedPatient.payments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <div>
                            <p className="font-medium text-green-600">{formatCurrency(payment.amount)}</p>
                            <p className="text-xs text-gray-500">{payment.method}</p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">{formatDate(payment.date)}</span>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تسجيل دفعة جديدة</DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-4 py-4">
              <div className="bg-blue-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600">المريض: <span className="font-medium">{selectedPatient.name}</span></p>
                <p className="text-sm text-gray-600 mt-1">
                  المتبقي: <span className="font-medium text-red-600">{formatCurrency(selectedPatient.pendingPayment)}</span>
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>المبلغ</Label>
                <Input 
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: Number(e.target.value) })}
                  max={selectedPatient.pendingPayment}
                />
              </div>
              
              <div className="space-y-2">
                <Label>طريقة الدفع</Label>
                <Select 
                  value={paymentData.method} 
                  onValueChange={(v: 'نقدي' | 'فيزا' | 'تحويل بنكي') => setPaymentData({ ...paymentData, method: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="نقدي">نقدي</SelectItem>
                    <SelectItem value="فيزا">فيزا</SelectItem>
                    <SelectItem value="تحويل بنكي">تحويل بنكي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button 
                  className="bg-green-500 hover:bg-green-600"
                  onClick={handleAddPayment}
                  disabled={paymentData.amount <= 0 || paymentData.amount > selectedPatient.pendingPayment}
                >
                  تسجيل الدفعة
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
