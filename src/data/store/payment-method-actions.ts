
import { supabase } from '@/integrations/supabase/client';
import { defaultPaymentMethods } from './defaults';
import { StoreState } from './types';
import { toast } from 'sonner';

export const createPaymentMethodActions = (set: (fn: (state: StoreState) => Partial<StoreState>) => void, get: () => StoreState) => ({
  // Fetch payment methods from Supabase
  fetchPaymentMethods: async () => {
    try {
      const { data, error } = await supabase
        .from('user_payment_methods')
        .select('method');
      
      if (error) throw error;
      
      // Combine default payment methods with user's custom methods
      const customMethods = data.map(item => item.method);
      const allMethods = [...defaultPaymentMethods];
      
      // Add custom methods that are not in defaults
      customMethods.forEach(method => {
        if (!allMethods.includes(method)) {
          allMethods.push(method);
        }
      });
      
      set(() => ({ paymentMethods: allMethods }));
      
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      toast.error("Erro ao carregar métodos de pagamento");
    }
  },
  
  addPaymentMethod: async (method: string) => {
    try {
      const state = get();
      
      // Check if method already exists
      if (state.paymentMethods.includes(method)) {
        return;
      }
      
      // Check if default method
      if (defaultPaymentMethods.includes(method)) {
        set((state) => ({
          paymentMethods: [...state.paymentMethods, method]
        }));
        return;
      }
      
      // Get the session to check if user is authenticated
      const { data } = await supabase.auth.getSession();
      const userId = data?.session?.user?.id;
      
      if (!userId) {
        toast.error("Você precisa estar logado para adicionar métodos de pagamento");
        return;
      }
      
      // Save to Supabase
      const { error } = await supabase
        .from('user_payment_methods')
        .insert({
          id: crypto.randomUUID(),
          user_id: userId,
          method: method
        });
      
      if (error) throw error;
      
      // Update local state
      set((state) => ({
        paymentMethods: [...state.paymentMethods, method]
      }));
      
    } catch (error) {
      console.error("Error adding payment method:", error);
      toast.error("Erro ao adicionar método de pagamento");
    }
  },
  
  updatePaymentMethod: async (oldMethod: string, newMethod: string) => {
    try {
      const state = get();
      
      // Don't update if the new method already exists
      if (state.paymentMethods.includes(newMethod) && oldMethod !== newMethod) {
        return { paymentMethods: state.paymentMethods };
      }
      
      // Get the session to check if user is authenticated
      const { data } = await supabase.auth.getSession();
      const userId = data?.session?.user?.id;
      
      if (!userId) {
        toast.error("Você precisa estar logado para atualizar métodos de pagamento");
        return;
      }
      
      // Check if it's a custom method
      if (!defaultPaymentMethods.includes(oldMethod)) {
        // Update in Supabase
        const { error } = await supabase
          .from('user_payment_methods')
          .update({ method: newMethod })
          .eq('method', oldMethod)
          .eq('user_id', userId);
        
        if (error) throw error;
      }
      
      // Update in sales table if necessary
      const { error: salesError } = await supabase
        .from('sales')
        .update({ payment_method: newMethod })
        .eq('payment_method', oldMethod)
        .eq('user_id', userId);
        
      if (salesError) {
        console.error("Error updating sales payment methods:", salesError);
      }
      
      // Update local state
      set((state) => ({
        paymentMethods: state.paymentMethods.map(method => 
          method === oldMethod ? newMethod : method
        ),
        // Also update payment method in existing sales
        sales: state.sales.map(sale => 
          sale.paymentMethod === oldMethod 
            ? { ...sale, paymentMethod: newMethod } 
            : sale
        )
      }));
      
    } catch (error) {
      console.error("Error updating payment method:", error);
      toast.error("Erro ao atualizar método de pagamento");
    }
  },
    
  removePaymentMethod: async (method: string) => {
    try {
      // Don't remove default payment methods
      if (defaultPaymentMethods.includes(method)) {
        return;
      }
      
      // Get the session to check if user is authenticated
      const { data } = await supabase.auth.getSession();
      const userId = data?.session?.user?.id;
      
      if (!userId) {
        toast.error("Você precisa estar logado para remover métodos de pagamento");
        return;
      }
      
      // Remove from Supabase
      const { error } = await supabase
        .from('user_payment_methods')
        .delete()
        .eq('method', method)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Update local state
      set((state) => ({
        paymentMethods: state.paymentMethods.filter(m => m !== method)
      }));
      
    } catch (error) {
      console.error("Error removing payment method:", error);
      toast.error("Erro ao remover método de pagamento");
    }
  },
});
