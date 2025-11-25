export type TransactionType = 'income' | 'expense';
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export enum Category {
  Food = 'Food',
  Transport = 'Transport',
  Housing = 'Housing',
  Utilities = 'Utilities',
  Entertainment = 'Entertainment',
  Healthcare = 'Healthcare',
  Salary = 'Salary',
  Freelance = 'Freelance',
  Investment = 'Investment',
  Shopping = 'Shopping',
  Personal = 'Personal',
  Education = 'Education',
  Other = 'Other',
}

export interface User {
  id: string;
  username: string;
  password?: string; // In a real app, this should be hashed
  createdAt: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: Category | string;
  date: string; // ISO string YYYY-MM-DD
  description: string;
}

export interface RecurringTransaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: Category | string;
  description: string;
  startDate: string;
  frequency: RecurrenceFrequency;
  nextDueDate: string;
}

export interface Budget {
  id: string;
  category: string;
  amount: number; // Monthly limit
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface MonthlyData {
  month: string;
  income: number;
  expense: number;
}