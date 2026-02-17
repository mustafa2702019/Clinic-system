import { useState, useCallback } from 'react';
import type { Patient, Payment, Appointment, Transaction, InventoryItem, Branch } from '@/types';

const STORAGE_KEYS = {
  patients: 'ebtesamty_patients',
  appointments: 'ebtesamty_appointments',
  transactions: 'ebtesamty_transactions',
  inventory: 'ebtesamty_inventory',
};

// Sample data for initial state
const samplePatients: Patient[] = [
  {
    id: 1,
    name: 'أحمد محمد',
    phone: '01012345678',
    birthDate: '1990-05-15',
    branch: 'سمالوط',
    doctor: 'د. إبراهيم',
    treatment: 'حشو عصب',
    treatmentCost: 1500,
    totalPayments: 1000,
    pendingPayment: 500,
    lastVisit: '2026-02-15',
    status: 'active',
    payments: [
      { id: 1, amount: 500, date: '2026-02-10', method: 'نقدي' },
      { id: 2, amount: 500, date: '2026-02-15', method: 'نقدي' },
    ],
  },
  {
    id: 2,
    name: 'فاطمة علي',
    phone: '01123456789',
    birthDate: '1985-08-20',
    branch: 'التوفيقية',
    doctor: 'د. أحمد',
    treatment: 'تنظيف أسنان',
    treatmentCost: 500,
    totalPayments: 500,
    pendingPayment: 0,
    lastVisit: '2026-02-16',
    status: 'active',
    payments: [
      { id: 3, amount: 500, date: '2026-02-16', method: 'نقدي' },
    ],
  },
  {
    id: 3,
    name: 'محمد عبدالله',
    phone: '01234567890',
    birthDate: '1992-03-10',
    branch: 'قلوصنا',
    doctor: 'د. محمد',
    treatment: 'تركيب تاج',
    treatmentCost: 3000,
    totalPayments: 1500,
    pendingPayment: 1500,
    lastVisit: '2026-02-14',
    status: 'active',
    payments: [
      { id: 4, amount: 1500, date: '2026-02-14', method: 'فيزا' },
    ],
  },
];

const sampleAppointments: Appointment[] = [
  {
    id: 1,
    patientId: 1,
    patientName: 'أحمد محمد',
    branch: 'سمالوط',
    doctor: 'د. إبراهيم',
    date: '2026-02-17',
    time: '10:00',
    status: 'confirmed',
  },
  {
    id: 2,
    patientId: 2,
    patientName: 'فاطمة علي',
    branch: 'التوفيقية',
    doctor: 'د. أحمد',
    date: '2026-02-17',
    time: '11:30',
    status: 'pending',
  },
  {
    id: 3,
    patientId: 3,
    patientName: 'محمد عبدالله',
    branch: 'قلوصنا',
    doctor: 'د. محمد',
    date: '2026-02-18',
    time: '09:00',
    status: 'confirmed',
  },
];

const sampleTransactions: Transaction[] = [
  { id: 1, patientId: 1, patientName: 'أحمد محمد', amount: 500, type: 'كشف', date: '2026-02-10', paymentMethod: 'نقدي', branch: 'سمالوط' },
  { id: 2, patientId: 1, patientName: 'أحمد محمد', amount: 500, type: 'علاج', date: '2026-02-15', paymentMethod: 'نقدي', branch: 'سمالوط' },
  { id: 3, patientId: 2, patientName: 'فاطمة علي', amount: 500, type: 'كشف', date: '2026-02-16', paymentMethod: 'نقدي', branch: 'التوفيقية' },
  { id: 4, patientId: 3, patientName: 'محمد عبدالله', amount: 1500, type: 'علاج', date: '2026-02-14', paymentMethod: 'فيزا', branch: 'قلوصنا' },
];

const sampleInventory: InventoryItem[] = [
  { id: 1, name: 'ليدوكايين', category: 'مخدر', branch: 'سمالوط', quantity: 25, minThreshold: 10, unit: 'زجاجة' },
  { id: 2, name: 'حشوة ضوئية', category: 'حشوات', branch: 'سمالوط', quantity: 50, minThreshold: 20, unit: 'علبة' },
  { id: 3, name: 'قفازات طبية', category: 'مستلزمات', branch: 'التوفيقية', quantity: 8, minThreshold: 15, unit: 'كرتونة' },
  { id: 4, name: 'أدوات طبعة', category: 'مواد طبعة', branch: 'قلوصنا', quantity: 3, minThreshold: 10, unit: 'قطعة' },
];

export const branches: Branch[] = [
  { id: '1', name: 'سمالوط', address: 'شارع الجمهورية، سمالوط', phone: '086-1234567' },
  { id: '2', name: 'التوفيقية', address: 'شارع النيل، التوفيقية', phone: '086-2345678' },
  { id: '3', name: 'قلوصنا', address: 'شارع الجيش، قلوصنا', phone: '086-3456789' },
];

// Generic hook for localStorage data
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      setStoredValue(prev => {
        const valueToStore = value instanceof Function ? value(prev) : value;
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        return valueToStore;
      });
    } catch (error) {
      console.error(error);
    }
  }, [key]);

  return [storedValue, setValue];
}

export function usePatients() {
  const [patients, setPatients] = useLocalStorage<Patient[]>(STORAGE_KEYS.patients, samplePatients);

  const addPatient = useCallback((patient: Omit<Patient, 'id' | 'lastVisit' | 'payments'>) => {
    const newPatient: Patient = {
      ...patient,
      id: Date.now(),
      lastVisit: new Date().toISOString().split('T')[0],
      payments: patient.totalPayments > 0 ? [{
        id: Date.now(),
        amount: patient.totalPayments,
        date: new Date().toISOString().split('T')[0],
        method: 'نقدي',
      }] : [],
    };
    setPatients(prev => [...prev, newPatient]);
    return newPatient;
  }, [setPatients]);

  const updatePatient = useCallback((id: number, updates: Partial<Patient>) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, [setPatients]);

  const deletePatient = useCallback((id: number) => {
    setPatients(prev => prev.filter(p => p.id !== id));
  }, [setPatients]);

  const addPayment = useCallback((patientId: number, amount: number, method: 'نقدي' | 'فيزا' | 'تحويل بنكي' = 'نقدي') => {
    const payment: Payment = {
      id: Date.now(),
      amount,
      date: new Date().toISOString().split('T')[0],
      method,
    };
    
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        const newTotalPayments = p.totalPayments + amount;
        return {
          ...p,
          totalPayments: newTotalPayments,
          pendingPayment: Math.max(0, p.treatmentCost - newTotalPayments),
          payments: [...p.payments, payment],
        };
      }
      return p;
    }));
    
    return payment;
  }, [setPatients]);

  return { patients, addPatient, updatePatient, deletePatient, addPayment };
}

export function useAppointments() {
  const [appointments, setAppointments] = useLocalStorage<Appointment[]>(STORAGE_KEYS.appointments, sampleAppointments);

  const addAppointment = useCallback((appointment: Omit<Appointment, 'id'>) => {
    const newAppointment: Appointment = {
      ...appointment,
      id: Date.now(),
    };
    setAppointments(prev => [...prev, newAppointment]);
    return newAppointment;
  }, [setAppointments]);

  const updateAppointment = useCallback((id: number, updates: Partial<Appointment>) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  }, [setAppointments]);

  const deleteAppointment = useCallback((id: number) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
  }, [setAppointments]);

  const getTodayAppointments = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter(a => a.date === today);
  }, [appointments]);

  const getAppointmentsByDate = useCallback((date: string) => {
    return appointments.filter(a => a.date === date);
  }, [appointments]);

  return { 
    appointments, 
    addAppointment, 
    updateAppointment, 
    deleteAppointment,
    getTodayAppointments,
    getAppointmentsByDate,
  };
}

export function useTransactions() {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>(STORAGE_KEYS.transactions, sampleTransactions);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now(),
    };
    setTransactions(prev => [...prev, newTransaction]);
    return newTransaction;
  }, [setTransactions]);

  const deleteTransaction = useCallback((id: number) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, [setTransactions]);

  const getTransactionsByDateRange = useCallback((startDate: string, endDate: string) => {
    return transactions.filter(t => t.date >= startDate && t.date <= endDate);
  }, [transactions]);

  const getIncome = useCallback((startDate?: string, endDate?: string) => {
    const txs = startDate && endDate 
      ? transactions.filter(t => t.date >= startDate && t.date <= endDate)
      : transactions;
    return txs.filter(t => t.type === 'كشف' || t.type === 'علاج').reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const getExpenses = useCallback((startDate?: string, endDate?: string) => {
    const txs = startDate && endDate 
      ? transactions.filter(t => t.date >= startDate && t.date <= endDate)
      : transactions;
    return txs.filter(t => t.type === 'مصروف').reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  return { 
    transactions, 
    addTransaction, 
    deleteTransaction,
    getTransactionsByDateRange,
    getIncome,
    getExpenses,
  };
}

export function useInventory() {
  const [inventory, setInventory] = useLocalStorage<InventoryItem[]>(STORAGE_KEYS.inventory, sampleInventory);

  const addItem = useCallback((item: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: Date.now(),
    };
    setInventory(prev => [...prev, newItem]);
    return newItem;
  }, [setInventory]);

  const updateItem = useCallback((id: number, updates: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  }, [setInventory]);

  const deleteItem = useCallback((id: number) => {
    setInventory(prev => prev.filter(i => i.id !== id));
  }, [setInventory]);

  const getLowStockItems = useCallback(() => {
    return inventory.filter(i => i.quantity <= i.minThreshold);
  }, [inventory]);

  const getCriticalStockItems = useCallback(() => {
    return inventory.filter(i => i.quantity <= 5);
  }, [inventory]);

  return { 
    inventory, 
    addItem, 
    updateItem, 
    deleteItem,
    getLowStockItems,
    getCriticalStockItems,
  };
}

// Utility functions
export function formatCurrency(amount: number): string {
  return amount.toLocaleString('ar-EG') + ' ج.م';
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getArabicDayName(date: Date): string {
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  return days[date.getDay()];
}
