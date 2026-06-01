import { fetchData } from './api';
import type { DashboardStats, CashFlowItem, PeriodComparison } from '@/types';

export const dashboardService = {
  getStats: async (clinicId: number): Promise<DashboardStats> => {
    return fetchData<DashboardStats>(`/dashboard/${clinicId}/`);
  },

  getCashFlow: async (
    clinicId: number,
    params?: {
      start_date?: string;
      end_date?: string;
      flow_type?: 'in' | 'out';
      account_code_id?: number;
    }
  ): Promise<CashFlowItem[]> => {
    return fetchData<CashFlowItem[]>(`/cash-flow/${clinicId}/`, params);
  },

  comparePeriods: async (
    clinicId: number,
    params: {
      start1: string;
      end1: string;
      start2: string;
      end2: string;
    }
  ): Promise<PeriodComparison> => {
    return fetchData<PeriodComparison>(`/comparison/${clinicId}/`, params);
  },

  getBalanceGenerale: async (
    clinicId: number,
    params: {
      start_date: string;
      end_date: string;
      format?: 'simple' | 'legal';
    }
  ): Promise<any> => {
    return fetchData(`/balance-generale/${clinicId}/`, params);
  },

  getGrandLivre: async (
    clinicId: number,
    params: {
      start_date: string;
      end_date: string;
      account_code_id?: number;
    }
  ): Promise<any> => {
    return fetchData(`/grand-livre/${clinicId}/`, params);
  },

  getHistory: async (modelName: string, objectId: number): Promise<any> => {
    return fetchData(`/history/${modelName}/${objectId}/`);
  },
};
