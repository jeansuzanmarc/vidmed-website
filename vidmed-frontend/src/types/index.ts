// Types principaux pour VIDMED

export type UserRole = 'grand_superuser' | 'superuser' | 'manager';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone: string;
  clinic: number | null;
  is_active: boolean;
  fcm_token: string;
  date_joined: string;
  last_login: string | null;
}

export interface Clinic {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  is_active: boolean;
  user_count: number;
  created_at: string;
}

export interface AccountCode {
  id: number;
  code: string;
  name: string;
  account_type: 'revenue' | 'expense';
  category: string;
  description: string;
  is_active: boolean;
  legal_code: string;
  legal_name: string;
  account_class: string;
  created_at: string;
}

export interface DailyReport {
  id: number;
  clinic: number;
  clinic_name: string;
  report_date: string;
  submitted_by: number;
  submitted_by_name: string;
  patient_count: number;
  consultations: string;
  medicines: string;
  laboratory: string;
  radiology: string;
  surgery: string;
  other_revenue: string;
  total_revenue: string;
  revenue_per_patient: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: number;
  clinic: number;
  clinic_name: string;
  account_code: number;
  account_code_code: string;
  account_code_name: string;
  expense_date: string;
  description: string;
  amount: string;
  recorded_by: number;
  recorded_by_name: string;
  created_at: string;
  updated_at: string;
}

export interface Debt {
  id: number;
  clinic: number;
  clinic_name: string;
  debtor_name: string;
  debtor_phone: string;
  original_amount: string;
  initial_payment: string;
  remaining_amount: string;
  debt_date: string;
  due_date: string | null;
  description: string;
  is_paid: boolean;
  paid_date: string | null;
  created_by: number;
  created_by_name: string;
  is_overdue: boolean;
  days_since_creation: number;
  created_at: string;
  updated_at: string;
}

export interface DebtPayment {
  id: number;
  debt: number;
  debtor_name: string;
  payment_date: string;
  amount: string;
  payment_method: string;
  notes: string;
  recorded_by: number;
  recorded_by_name: string;
  created_at: string;
}

export interface CompanyDebt {
  id: number;
  clinic: number;
  clinic_name: string;
  creditor_name: string;
  creditor_phone: string;
  debt_type: string;
  debt_type_display: string;
  original_amount: string;
  remaining_amount: string;
  debt_date: string;
  due_date: string | null;
  description: string;
  is_paid: boolean;
  paid_date: string | null;
  created_by: number;
  created_by_name: string;
  is_overdue: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompanyDebtPayment {
  id: number;
  company_debt: number;
  creditor_name: string;
  payment_date: string;
  amount: string;
  payment_method: string;
  notes: string;
  recorded_by: number;
  recorded_by_name: string;
  created_at: string;
}

export interface OwnerTransaction {
  id: number;
  clinic: number;
  clinic_name: string;
  transaction_type: 'contribution' | 'withdrawal';
  transaction_type_display: string;
  transaction_date: string;
  amount: string;
  description: string;
  recorded_by: number;
  recorded_by_name: string;
  created_at: string;
}

export interface Alert {
  id: number;
  clinic: number;
  clinic_name: string;
  alert_type: string;
  alert_type_display: string;
  alert_level: 'info' | 'warning' | 'error';
  alert_level_display: string;
  alert_date: string;
  message: string;
  is_resolved: boolean;
  resolved_at: string | null;
  resolved_by: number | null;
  resolved_by_name: string | null;
  whatsapp_sent: boolean;
  whatsapp_sent_at: string | null;
  created_at: string;
}

export interface SavedFilter {
  id: number;
  user: number;
  name: string;
  filter_type: string;
  filter_params: Record<string, any>;
  is_default: boolean;
  created_at: string;
}

export interface DashboardStats {
  total_revenue: string;
  total_expenses: string;
  net_result: string;
  cash_balance: string;
  total_patient_debts: string;
  total_company_debts: string;
  missing_reports_count: number;
  overdue_debts_count: number;
}

export interface CashFlowItem {
  source: string;
  source_detail: string;
  source_id: number;
  clinic_id: number;
  transaction_date: string;
  account_code_id: number | null;
  account_code_name: string | null;
  account_code_code: string | null;
  flow_type: 'in' | 'out';
  amount: string;
  user_id: number | null;
  user_name: string | null;
  description: string | null;
  created_at: string;
}

export interface PeriodComparison {
  period1_label: string;
  period1_revenue: string;
  period1_expenses: string;
  period1_net: string;
  period2_label: string;
  period2_revenue: string;
  period2_expenses: string;
  period2_net: string;
  revenue_variation: string;
  expenses_variation: string;
  net_variation: string;
  analysis: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  detail: string;
  errors?: Record<string, string[]>;
}
