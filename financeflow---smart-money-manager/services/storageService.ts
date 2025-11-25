import { Transaction, Budget, SavingsGoal, RecurringTransaction, User } from '../types';

const USERS_KEY = 'finance_flow_users_v1';
const SESSION_KEY = 'finance_flow_session_v1';

// Helper to get user-specific key
const getKey = (userId: string, keyType: string) => `finance_flow_${userId}_${keyType}`;

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// --- Authentication ---

export const getUsers = (): User[] => {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
};

export const registerUser = (username: string, password: string): User | null => {
  const users = getUsers();
  if (users.some(u => u.username === username)) {
    return null; // User already exists
  }
  
  const newUser: User = {
    id: generateId(),
    username,
    password, // Note: storing plain text for demo only.
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return newUser;
};

export const loginUser = (username: string, password: string): User | null => {
  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    const { password, ...safeUser } = user;
    localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
    return safeUser as User;
  }
  return null;
};

export const logoutUser = (): void => {
  localStorage.removeItem(SESSION_KEY);
};

export const getCurrentSession = (): User | null => {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

// --- Transactions ---

export const getTransactions = (userId: string): Transaction[] => {
  try {
    const stored = localStorage.getItem(getKey(userId, 'transactions'));
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to load transactions", error);
    return [];
  }
};

export const saveTransactions = (userId: string, transactions: Transaction[]): void => {
  try {
    localStorage.setItem(getKey(userId, 'transactions'), JSON.stringify(transactions));
  } catch (error) {
    console.error("Failed to save transactions", error);
  }
};

// --- Budgets ---

export const getBudgets = (userId: string): Budget[] => {
  try {
    const stored = localStorage.getItem(getKey(userId, 'budgets'));
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
};

export const saveBudgets = (userId: string, budgets: Budget[]): void => {
  localStorage.setItem(getKey(userId, 'budgets'), JSON.stringify(budgets));
};

// --- Goals ---

export const getGoals = (userId: string): SavingsGoal[] => {
  try {
    const stored = localStorage.getItem(getKey(userId, 'goals'));
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
};

export const saveGoals = (userId: string, goals: SavingsGoal[]): void => {
  localStorage.setItem(getKey(userId, 'goals'), JSON.stringify(goals));
};

// --- Recurring Transactions ---

export const getRecurringTransactions = (userId: string): RecurringTransaction[] => {
  try {
    const stored = localStorage.getItem(getKey(userId, 'recurring'));
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
};

export const saveRecurringTransactions = (userId: string, recurring: RecurringTransaction[]): void => {
  localStorage.setItem(getKey(userId, 'recurring'), JSON.stringify(recurring));
};

export const processRecurringTransactions = (userId: string): Transaction[] => {
  const recurring = getRecurringTransactions(userId);
  const existingTransactions = getTransactions(userId);
  
  if (recurring.length === 0) return existingTransactions;

  let newTransactions: Transaction[] = [];
  let updatedRecurring = false;
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today

  const updatedRules = recurring.map(rule => {
    let nextDate = new Date(rule.nextDueDate);
    let iterations = 0;
    const MAX_ITERATIONS = 365 * 2; // Safety break

    while (nextDate <= today && iterations < MAX_ITERATIONS) {
      // Create transaction
      const dateStr = nextDate.toISOString().split('T')[0];
      const t: Transaction = {
        id: generateId(),
        amount: rule.amount,
        type: rule.type,
        category: rule.category,
        description: rule.description,
        date: dateStr
      };
      newTransactions.push(t);

      // Advance date
      if (rule.frequency === 'daily') nextDate.setDate(nextDate.getDate() + 1);
      if (rule.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
      if (rule.frequency === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
      if (rule.frequency === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);
      
      updatedRecurring = true;
      iterations++;
    }
    
    return { ...rule, nextDueDate: nextDate.toISOString().split('T')[0] };
  });

  if (updatedRecurring) {
    saveRecurringTransactions(userId, updatedRules);
    const combined = [...existingTransactions, ...newTransactions];
    saveTransactions(userId, combined);
    return combined;
  }

  return existingTransactions;
};