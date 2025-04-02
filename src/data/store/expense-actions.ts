
import { supabase } from '@/integrations/supabase/client';
import { StoreState } from './types';

export const createExpenseActions = (set: (fn: (state: StoreState) => Partial<StoreState>) => void) => ({
  addExpense: async (expense: any) => {
    try {
      // First get the user ID
      const { data } = await supabase.auth.getSession();
      const userId = data?.session?.user?.id || null;
      
      // Then update the state
      set((state) => ({
        expenses: [...state.expenses, {
          ...expense,
          id: crypto.randomUUID(),
          date: new Date(),
          user_id: userId
        }]
      }));
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  },
  
  // New action for retroactive expenses
  addRetroactiveExpense: async (expense: any, customDate: Date) => {
    try {
      // First get the user ID
      const { data } = await supabase.auth.getSession();
      const userId = data?.session?.user?.id || null;
      
      // Then update the state
      set((state) => ({
        expenses: [...state.expenses, {
          ...expense,
          id: crypto.randomUUID(),
          date: customDate,
          user_id: userId
        }]
      }));
    } catch (error) {
      console.error("Error adding retroactive expense:", error);
    }
  },
  
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
