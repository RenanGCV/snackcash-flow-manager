
import { supabase } from '@/integrations/supabase/client';
import { StoreState } from './types';
import { toast } from 'sonner';

export const createExpenseActions = (set: (fn: (state: StoreState) => Partial<StoreState>) => void, get: () => StoreState) => ({
  // Fetch expenses from Supabase
  fetchExpenses: async () => {
    try {
      // Fetch all expenses
      const { data: expenses, error: expenseError } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });
      
      if (expenseError) throw expenseError;
      
      // Fetch tags for each expense
      const expensesWithTags = await Promise.all(expenses.map(async (expense) => {
        const { data: tags, error: tagsError } = await supabase
          .from('expense_tags')
          .select('tag')
          .eq('expense_id', expense.id);
        
        if (tagsError) throw tagsError;
        
        return {
          ...expense,
          id: expense.id,
          description: expense.description,
          amount: Number(expense.amount),
          category: expense.category as 'fixed' | 'variable',
          date: new Date(expense.date),
          isRecurring: expense.is_recurring,
          recurrenceDay: expense.recurrence_day,
          tags: tags.map(t => t.tag)
        };
      }));
      
      set(() => ({ expenses: expensesWithTags }));
      
    } catch (error) {
      console.error("Error fetching expenses:", error);
      toast.error("Erro ao carregar despesas");
    }
  },
  
  addExpense: async (expense: any) => {
    try {
      // Get the session to check if user is authenticated
      const { data } = await supabase.auth.getSession();
      const userId = data?.session?.user?.id;
      
      if (!userId) {
        toast.error("Você precisa estar logado para adicionar despesas");
        return;
      }
      
      // Create expense record
      const expenseId = crypto.randomUUID();
      const expenseData = {
        id: expenseId,
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        is_recurring: expense.isRecurring || false,
        recurrence_day: expense.recurrenceDay,
        date: new Date().toISOString(),
        user_id: userId
      };
      
      // Save expense to Supabase
      const { error: expenseError } = await supabase
        .from('expenses')
        .insert(expenseData);
      
      if (expenseError) throw expenseError;
      
      // Save tags if any
      if (expense.tags && expense.tags.length > 0) {
        const tagData = expense.tags.map((tag: string) => ({
          id: crypto.randomUUID(),
          expense_id: expenseId,
          tag: tag
        }));
        
        const { error: tagError } = await supabase
          .from('expense_tags')
          .insert(tagData);
        
        if (tagError) throw tagError;
      }
      
      // Update local state
      set((state) => ({
        expenses: [...state.expenses, {
          ...expense,
          id: expenseId,
          date: new Date(),
          user_id: userId
        }]
      }));
      
    } catch (error) {
      console.error("Error adding expense:", error);
      toast.error("Erro ao adicionar despesa");
    }
  },
  
  addRetroactiveExpense: async (expense: any, customDate: Date) => {
    try {
      // Get the session to check if user is authenticated
      const { data } = await supabase.auth.getSession();
      const userId = data?.session?.user?.id;
      
      if (!userId) {
        toast.error("Você precisa estar logado para adicionar despesas retroativas");
        return;
      }
      
      // Create expense record
      const expenseId = crypto.randomUUID();
      const expenseData = {
        id: expenseId,
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        is_recurring: expense.isRecurring || false,
        recurrence_day: expense.recurrenceDay,
        date: customDate.toISOString(),
        user_id: userId
      };
      
      // Save expense to Supabase
      const { error: expenseError } = await supabase
        .from('expenses')
        .insert(expenseData);
      
      if (expenseError) throw expenseError;
      
      // Save tags if any
      if (expense.tags && expense.tags.length > 0) {
        const tagData = expense.tags.map((tag: string) => ({
          id: crypto.randomUUID(),
          expense_id: expenseId,
          tag: tag
        }));
        
        const { error: tagError } = await supabase
          .from('expense_tags')
          .insert(tagData);
        
        if (tagError) throw tagError;
      }
      
      // Update local state
      set((state) => ({
        expenses: [...state.expenses, {
          ...expense,
          id: expenseId,
          date: customDate,
          user_id: userId
        }]
      }));
      
    } catch (error) {
      console.error("Error adding retroactive expense:", error);
      toast.error("Erro ao adicionar despesa retroativa");
    }
  },
  
  updateExpense: async (id: string, updates: any) => {
    try {
      // Update expense in Supabase
      const expenseUpdates: any = { ...updates };
      if (updates.isRecurring !== undefined) expenseUpdates.is_recurring = updates.isRecurring;
      if (updates.recurrenceDay !== undefined) expenseUpdates.recurrence_day = updates.recurrenceDay;
      
      const { error: expenseError } = await supabase
        .from('expenses')
        .update(expenseUpdates)
        .eq('id', id);
      
      if (expenseError) throw expenseError;
      
      // Update tags if needed
      if (updates.tags !== undefined) {
        // First, delete existing tags
        const { error: deleteError } = await supabase
          .from('expense_tags')
          .delete()
          .eq('expense_id', id);
        
        if (deleteError) throw deleteError;
        
        // Insert new tags
        if (updates.tags && updates.tags.length > 0) {
          const tagData = updates.tags.map((tag: string) => ({
            id: crypto.randomUUID(),
            expense_id: id,
            tag: tag
          }));
          
          const { error: insertError } = await supabase
            .from('expense_tags')
            .insert(tagData);
          
          if (insertError) throw insertError;
        }
      }
      
      // Update local state
      set((state) => ({
        expenses: state.expenses.map(expense => 
          expense.id === id 
            ? { ...expense, ...updates } 
            : expense
        )
      }));
      
    } catch (error) {
      console.error("Error updating expense:", error);
      toast.error("Erro ao atualizar despesa");
    }
  },
  
  deleteExpense: async (id: string) => {
    try {
      // First delete tags (due to foreign key constraint)
      const { error: tagsError } = await supabase
        .from('expense_tags')
        .delete()
        .eq('expense_id', id);
      
      if (tagsError) throw tagsError;
      
      // Then delete expense
      const { error: expenseError } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
      
      if (expenseError) throw expenseError;
      
      // Update local state
      set((state) => ({
        expenses: state.expenses.filter(expense => expense.id !== id)
      }));
      
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("Erro ao excluir despesa");
    }
  },
});
