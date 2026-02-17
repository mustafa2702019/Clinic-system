import { useState, useMemo } from 'react';
import { 
  Plus, 
  Package, 
  AlertTriangle,
  Edit,
  Trash2,
  Search,
  Filter,
  XCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useInventory, branches } from '@/hooks/useData';
import type { InventoryItem } from '@/types';
import { toast } from 'sonner';

const categories = ['مخدر', 'حشوات', 'مواد طبعة', 'أدوات', 'مستلزمات'];
const units = ['علبة', 'قطعة', 'زجاجة', 'كرتونة', 'علبة'];

export function Inventory() {
  const { inventory, addItem, updateItem, deleteItem, getLowStockItems, getCriticalStockItems } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    branch: '',
    quantity: 0,
    minThreshold: 10,
    unit: 'علبة',
  });

  const lowStockItems = getLowStockItems();
  const criticalItems = getCriticalStockItems();

  // Filter inventory
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBranch = branchFilter === 'all' || item.branch === branchFilter;
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      return matchesSearch && matchesBranch && matchesCategory;
    });
  }, [inventory, searchTerm, branchFilter, categoryFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: inventory.length,
    lowStock: lowStockItems.filter(i => i.quantity > 5).length,
    critical: criticalItems.length,
  }), [inventory, lowStockItems, criticalItems]);

  const handleAddItem = () => {
    addItem(formData);
    toast.success('تم إضافة المادة بنجاح');
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleUpdateItem = () => {
    if (!editingItem) return;
    updateItem(editingItem.id, formData);
    toast.success('تم تحديث المادة بنجاح');
    setIsAddDialogOpen(false);
    setEditingItem(null);
    resetForm();
  };

  const handleDeleteItem = (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذه المادة؟')) {
      deleteItem(id);
      toast.success('تم حذف المادة بنجاح');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      branch: '',
      quantity: 0,
      minThreshold: 10,
      unit: 'علبة',
    });
  };

  const openEditDialog = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      branch: item.branch,
      quantity: item.quantity,
      minThreshold: item.minThreshold,
      unit: item.unit,
    });
    setIsAddDialogOpen(true);
  };

  const getStatusBadge = (item: InventoryItem) => {
    if (item.quantity <= 5) {
      return <Badge className="bg-red-500">حرج</Badge>;
    }
    if (item.quantity <= item.minThreshold) {
      return <Badge className="bg-yellow-500">منخفض</Badge>;
    }
    return <Badge className="bg-green-500">جيد</Badge>;
  };

  const getStatusClass = (item: InventoryItem) => {
    if (item.quantity <= 5) return 'bg-red-50 border-red-200';
    if (item.quantity <= item.minThreshold) return 'bg-yellow-50 border-yellow-200';
    return '';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة المخزون</h1>
          <p className="text-gray-500 mt-1">إدارة المواد والمستلزمات الطبية</p>
        </div>
        <Button className="bg-green-500 hover:bg-green-600" onClick={() => {
          setEditingItem(null);
          resetForm();
          setIsAddDialogOpen(true);
        }}>
          <Plus className="w-4 h-4 ml-2" />
          إضافة مادة جديدة
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">إجمالي المواد</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">مواد منخفضة</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.lowStock}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">مواد حرجة</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.critical}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-xl">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(stats.critical > 0 || stats.lowStock > 0) && (
        <div className="space-y-3">
          {stats.critical > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <div>
                <p className="font-medium text-red-700">تنبيه: مواد حرجة في المخزون</p>
                <p className="text-sm text-red-600">{stats.critical} مواد تحتاج إعادة طلب فورية</p>
              </div>
            </div>
          )}
          {stats.lowStock > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-700">تنبيه: مواد منخفضة</p>
                <p className="text-sm text-yellow-600">{stats.lowStock} مواد وصلت للحد الأدنى</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[250px] relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="ابحث عن مادة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger className="w-[160px]">
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
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="التصنيف" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع التصنيفات</SelectItem>
                {categories.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">#</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">اسم المادة</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">التصنيف</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">الفرع</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">الكمية</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">الحد الأدنى</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">الحالة</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item, index) => (
                  <tr 
                    key={item.id} 
                    className={`border-b hover:bg-gray-50 ${getStatusClass(item)}`}
                  >
                    <td className="px-4 py-3 text-sm">{index + 1}</td>
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant="secondary">{item.category}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">{item.branch}</td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${
                        item.quantity <= 5 ? 'text-red-600' : 
                        item.quantity <= item.minThreshold ? 'text-yellow-600' : 
                        'text-green-600'
                      }`}>
                        {item.quantity} {item.unit}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.minThreshold} {item.unit}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(item)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-amber-500"
                          onClick={() => openEditDialog(item)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-500"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredInventory.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>لا توجد مواد في المخزون</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'تعديل المادة' : 'إضافة مادة جديدة'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>اسم المادة *</Label>
              <Input 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="أدخل اسم المادة"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>التصنيف *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(v) => setFormData({ ...formData, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر التصنيف" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>الكمية *</Label>
                <Input 
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  min={0}
                />
              </div>
              <div className="space-y-2">
                <Label>الحد الأدنى *</Label>
                <Input 
                  type="number"
                  value={formData.minThreshold}
                  onChange={(e) => setFormData({ ...formData, minThreshold: Number(e.target.value) })}
                  min={1}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>الوحدة *</Label>
              <Select 
                value={formData.unit} 
                onValueChange={(v) => setFormData({ ...formData, unit: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {units.map(u => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                إلغاء
              </Button>
              <Button 
                className="bg-green-500 hover:bg-green-600"
                onClick={editingItem ? handleUpdateItem : handleAddItem}
                disabled={!formData.name || !formData.category || !formData.branch}
              >
                {editingItem ? 'حفظ التغييرات' : 'إضافة مادة'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
