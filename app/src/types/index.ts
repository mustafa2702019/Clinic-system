// Types for Ebtesamty Dental Clinic Management System

export interface Patient {
  id: number;
  name: string;
  phone: string;
  birthDate?: string;
  branch: string;
  doctor: string;
  treatment?: string;
  treatmentCost: number;
  totalPayments: number;
  pendingPayment: number;
  lastVisit: string;
  status: 'active' | 'inactive';
  payments: Payment[];
}

export interface Payment {
  id: number;
  amount: number;
  date: string;
  method: 'نقدي' | 'فيزا' | 'تحويل بنكي';
}

export interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  branch: string;
  doctor: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Transaction {
  id: number;
  patientId?: number;
  patientName: string;
  amount: number;
  type: 'كشف' | 'علاج' | 'مصروف';
  date: string;
  paymentMethod: string;
  branch: string;
  treatment?: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  branch: string;
  quantity: number;
  minThreshold: number;
  unit: string;
}

export interface Branch {
  id: string;
  name: string;
  address?: string;
  phone?: string;
}

export type ViewType = 'dashboard' | 'patients' | 'appointments' | 'revenue' | 'inventory';
