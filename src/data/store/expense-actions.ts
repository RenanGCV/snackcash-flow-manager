
import { supabase } from '@/integrations/supabase/client';
import { StoreState } from './types';

export const createExpenseActions = (set: (fn: (state: StoreState) => Partial<StoreState>) => void) => ({
  addExpense: (expense: any) => 
    set((state) => {
      const userId = supabase.auth.getSession()
        .then(res => res.data?.session?.user?.id || null);
      
      return {
        expenses: [...state.expenses, {
          ...expense,
          id: crypto.randomUUID(),
          date: new Date(),
          user_id: userId
        }]
      };
    }),
  
  updateExpense: (id: string, updates: any) => 
    set((state) => ({
      expenses: state.expenses.map(expense => 
        expense.id === id 
          ? { ...expense, ...updates } 
          : expense
      )
    })),
  
  deleteExpense: (id: string) => 
    set((state) => ({
      expenses: state.expenses.filter(expense => expense.id !== id)
    })),
});
