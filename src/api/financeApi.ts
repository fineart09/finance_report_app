// ตัวอย่าง API สำหรับ Finance Report
// เพิ่ม function ตามที่ backend รองรับ

import apiClient from './apiClient';

export interface FinanceReport {
  id: number;
  title: string;
  amount: number;
  date: string;
  category: string;
}

export const financeApi = {
  getReports: () => apiClient.get<FinanceReport[]>('/reports'),
  getReportById: (id: number) => apiClient.get<FinanceReport>(`/reports/${id}`),
  createReport: (data: Omit<FinanceReport, 'id'>) => apiClient.post<FinanceReport>('/reports', data),
  updateReport: (id: number, data: Partial<FinanceReport>) => apiClient.put<FinanceReport>(`/reports/${id}`, data),
  deleteReport: (id: number) => apiClient.delete(`/reports/${id}`),
};
