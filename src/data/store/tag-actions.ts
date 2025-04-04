
import { supabase } from '@/integrations/supabase/client';
import { defaultExpenseTags } from './defaults';
import { StoreState } from './types';
import { toast } from 'sonner';

export const createTagActions = (set: (fn: (state: StoreState) => Partial<StoreState>) => void, get: () => StoreState) => ({
  // Fetch expense tags from Supabase
  fetchExpenseTags: async () => {
    try {
      const { data, error } = await supabase
        .from('user_expense_tags')
        .select('tag');
      
      if (error) throw error;
      
      // Combine default tags with user's custom tags
      const customTags = data.map(item => item.tag);
      const allTags = [...defaultExpenseTags];
      
      // Add custom tags that are not in defaults
      customTags.forEach(tag => {
        if (!allTags.includes(tag)) {
          allTags.push(tag);
        }
      });
      
      set(() => ({ expenseTags: allTags }));
      
    } catch (error) {
      console.error("Error fetching expense tags:", error);
      toast.error("Erro ao carregar tags de despesas");
    }
  },
  
  addExpenseTag: async (tag: string) => {
    try {
      const state = get();
      
      // Check if tag already exists
      if (state.expenseTags.includes(tag)) {
        return;
      }
      
      // Get the session to check if user is authenticated
      const { data } = await supabase.auth.getSession();
      const userId = data?.session?.user?.id;
      
      if (!userId) {
        toast.error("Você precisa estar logado para adicionar tags de despesas");
        return;
      }
      
      // Save to Supabase
      const { error } = await supabase
        .from('user_expense_tags')
        .insert({
          id: crypto.randomUUID(),
          user_id: userId,
          tag: tag
        });
      
      if (error) throw error;
      
      // Update local state
      set((state) => ({
        expenseTags: [...state.expenseTags, tag]
      }));
      
    } catch (error) {
      console.error("Error adding expense tag:", error);
      toast.error("Erro ao adicionar tag de despesa");
    }
  },
    
  updateExpenseTag: async (oldTag: string, newTag: string) => {
    try {
      const state = get();
      
      // Don't update if the new tag already exists
      if (state.expenseTags.includes(newTag) && oldTag !== newTag) {
        return;
      }
      
      // Get the session to check if user is authenticated
      const { data } = await supabase.auth.getSession();
      const userId = data?.session?.user?.id;
      
      if (!userId) {
        toast.error("Você precisa estar logado para atualizar tags de despesas");
        return;
      }
      
      // Update user_expense_tags in Supabase
      const { error: tagError } = await supabase
        .from('user_expense_tags')
        .update({ tag: newTag })
        .eq('tag', oldTag)
        .eq('user_id', userId);
      
      if (tagError) {
        console.error("Error updating user tag:", tagError);
      }
      
      // Update expense_tags in Supabase
      // First, find expense ids with this tag from the current user's expenses
      const { data: expenseIds } = await supabase
        .from('expenses')
        .select('id')
        .eq('user_id', userId);
      
      if (expenseIds && expenseIds.length > 0) {
        const ids = expenseIds.map(e => e.id);
        
        // Update tags for these expenses
        const { error: expenseTagError } = await supabase
          .from('expense_tags')
          .update({ tag: newTag })
          .eq('tag', oldTag)
          .in('expense_id', ids);
        
        if (expenseTagError) {
          console.error("Error updating expense tags:", expenseTagError);
        }
      }
      
      // Update local state
      set((state) => ({
        expenseTags: state.expenseTags.map(tag => 
          tag === oldTag ? newTag : tag
        ),
        // Also update tag in existing expenses
        expenses: state.expenses.map(expense => 
          expense.tags?.includes(oldTag) 
            ? { 
                ...expense, 
                tags: expense.tags.map(t => t === oldTag ? newTag : t) 
              } 
            : expense
        )
      }));
      
    } catch (error) {
      console.error("Error updating expense tag:", error);
      toast.error("Erro ao atualizar tag de despesa");
    }
  },
    
  removeExpenseTag: async (tag: string) => {
    try {
      // Get the session to check if user is authenticated
      const { data } = await supabase.auth.getSession();
      const userId = data?.session?.user?.id;
      
      if (!userId) {
        toast.error("Você precisa estar logado para remover tags de despesas");
        return;
      }
      
      // Remove from user_expense_tags in Supabase
      const { error: userTagError } = await supabase
        .from('user_expense_tags')
        .delete()
        .eq('tag', tag)
        .eq('user_id', userId);
      
      if (userTagError) {
        console.error("Error removing user tag:", userTagError);
      }
      
      // Find expense ids with this tag from the current user's expenses
      const { data: expenseIds } = await supabase
        .from('expenses')
        .select('id')
        .eq('user_id', userId);
      
      if (expenseIds && expenseIds.length > 0) {
        const ids = expenseIds.map(e => e.id);
        
        // Remove tags from expense_tags
        const { error: expenseTagError } = await supabase
          .from('expense_tags')
          .delete()
          .eq('tag', tag)
          .in('expense_id', ids);
        
        if (expenseTagError) {
          console.error("Error removing expense tags:", expenseTagError);
        }
      }
      
      // Update local state
      set((state) => ({
        expenseTags: state.expenseTags.filter(t => t !== tag),
        // Also remove the tag from any expenses that were using it
        expenses: state.expenses.map(expense => 
          expense.tags?.includes(tag)
            ? {
                ...expense,
                tags: expense.tags.filter(t => t !== tag)
              }
            : expense
        )
      }));
      
    } catch (error) {
      console.error("Error removing expense tag:", error);
      toast.error("Erro ao remover tag de despesa");
    }
  },
});
