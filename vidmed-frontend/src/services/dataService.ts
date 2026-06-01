import { fetchPaginated, fetchData, postData, putData, patchData, deleteData } from './api';
import type {
  PaginatedResponse,
  DailyReport,
  Expense,
  Debt,
  DebtPayment,
  CompanyDebt,
  CompanyDebtPayment,
  OwnerTransaction,
  Alert,
  AccountCode,
  Clinic,
  User,
  SavedFilter,
} from '@/types';

// Daily Reports
export const dailyReportService = {
  list: (params?: Record<string, any>) =>
    fetchPaginated<DailyReport>('/daily-reports/', params),

  get: (id: number) =>
    fetchData<DailyReport>(`/daily-reports/${id}/`),

  create: (data: Partial<DailyReport>) =>
    postData<DailyReport>('/daily-reports/', data),

  update: (id: number, data: Partial<DailyReport>) =>
    putData<DailyReport>(`/daily-reports/${id}/`, data),

  delete: (id: number) =>
    deleteData(`/daily-reports/${id}/`),
};

// Expenses
export const expenseService = {
  list: (params?: Record<string, any>) =>
    fetchPaginated<Expense>('/expenses/', params),

  get: (id: number) =>
    fetchData<Expense>(`/expenses/${id}/`),

  create: (data: Partial<Expense>) =>
    postData<Expense>('/expenses/', data),

  update: (id: number, data: Partial<Expense>) =>
    putData<Expense>(`/expenses/${id}/`, data),

  delete: (id: number) =>
    deleteData(`/expenses/${id}/`),
};

// Patient Debts
export const debtService = {
  list: (params?: Record<string, any>) =>
    fetchPaginated<Debt>('/patient-debts/', params),

  get: (id: number) =>
    fetchData<Debt>(`/patient-debts/${id}/`),

  create: (data: Partial<Debt>) =>
    postData<Debt>('/patient-debts/', data),

  update: (id: number, data: Partial<Debt>) =>
    putData<Debt>(`/patient-debts/${id}/`, data),

  delete: (id: number) =>
    deleteData(`/patient-debts/${id}/`),

  getOverdue: () =>
    fetchData<Debt[]>('/patient-debts/overdue/'),
};

// Debt Payments
export const debtPaymentService = {
  list: (params?: Record<string, any>) =>
    fetchPaginated<DebtPayment>('/debt-payments/', params),

  create: (data: Partial<DebtPayment>) =>
    postData<DebtPayment>('/debt-payments/', data),
};

// Company Debts
export const companyDebtService = {
  list: (params?: Record<string, any>) =>
    fetchPaginated<CompanyDebt>('/company-debts/', params),

  get: (id: number) =>
    fetchData<CompanyDebt>(`/company-debts/${id}/`),

  create: (data: Partial<CompanyDebt>) =>
    postData<CompanyDebt>('/company-debts/', data),

  update: (id: number, data: Partial<CompanyDebt>) =>
    putData<CompanyDebt>(`/company-debts/${id}/`, data),

  delete: (id: number) =>
    deleteData(`/company-debts/${id}/`),

  getOverdue: () =>
    fetchData<CompanyDebt[]>('/company-debts/overdue/'),
};

// Company Debt Payments
export const companyDebtPaymentService = {
  list: (params?: Record<string, any>) =>
    fetchPaginated<CompanyDebtPayment>('/company-debt-payments/', params),

  create: (data: Partial<CompanyDebtPayment>) =>
    postData<CompanyDebtPayment>('/company-debt-payments/', data),
};

// Owner Transactions
export const ownerTransactionService = {
  list: (params?: Record<string, any>) =>
    fetchPaginated<OwnerTransaction>('/owner-transactions/', params),

  get: (id: number) =>
    fetchData<OwnerTransaction>(`/owner-transactions/${id}/`),

  create: (data: Partial<OwnerTransaction>) =>
    postData<OwnerTransaction>('/owner-transactions/', data),

  update: (id: number, data: Partial<OwnerTransaction>) =>
    putData<OwnerTransaction>(`/owner-transactions/${id}/`, data),

  delete: (id: number) =>
    deleteData(`/owner-transactions/${id}/`),
};

// Alerts
export const alertService = {
  list: (params?: Record<string, any>) =>
    fetchPaginated<Alert>('/alerts/', params),

  get: (id: number) =>
    fetchData<Alert>(`/alerts/${id}/`),

  resolve: (id: number) =>
    postData<Alert>(`/alerts/${id}/resolve/`, {}),
};

// Account Codes
export const accountCodeService = {
  list: (params?: Record<string, any>) =>
    fetchPaginated<AccountCode>('/account-codes/', params),

  get: (id: number) =>
    fetchData<AccountCode>(`/account-codes/${id}/`),

  create: (data: Partial<AccountCode>) =>
    postData<AccountCode>('/account-codes/', data),

  update: (id: number, data: Partial<AccountCode>) =>
    putData<AccountCode>(`/account-codes/${id}/`, data),

  delete: (id: number) =>
    deleteData(`/account-codes/${id}/`),
};

// Clinics
export const clinicService = {
  list: (params?: Record<string, any>) =>
    fetchPaginated<Clinic>('/clinics/', params),

  get: (id: number) =>
    fetchData<Clinic>(`/clinics/${id}/`),

  create: (data: Partial<Clinic>) =>
    postData<Clinic>('/clinics/', data),

  update: (id: number, data: Partial<Clinic>) =>
    putData<Clinic>(`/clinics/${id}/`, data),

  delete: (id: number) =>
    deleteData(`/clinics/${id}/`),
};

// Users
export const userService = {
  list: (params?: Record<string, any>) =>
    fetchPaginated<User>('/users/', params),

  get: (id: number) =>
    fetchData<User>(`/users/${id}/`),

  create: (data: Partial<User>) =>
    postData<User>('/users/', data),

  update: (id: number, data: Partial<User>) =>
    putData<User>(`/users/${id}/`, data),

  delete: (id: number) =>
    deleteData(`/users/${id}/`),
};

// Saved Filters
export const savedFilterService = {
  list: (params?: Record<string, any>) =>
    fetchPaginated<SavedFilter>('/saved-filters/', params),

  get: (id: number) =>
    fetchData<SavedFilter>(`/saved-filters/${id}/`),

  create: (data: Partial<SavedFilter>) =>
    postData<SavedFilter>('/saved-filters/', data),

  update: (id: number, data: Partial<SavedFilter>) =>
    putData<SavedFilter>(`/saved-filters/${id}/`, data),

  delete: (id: number) =>
    deleteData(`/saved-filters/${id}/`),
};
