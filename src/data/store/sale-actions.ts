
import { supabase } from '@/integrations/supabase/client';
import { StoreState } from './types';

export const createSaleActions = (set: (fn: (state: StoreState) => Partial<StoreState>) => void) => ({
  addSale: async (products: { productId: string, quantity: number }[], paymentMethod: string) => {
    try {
      // Get the current user session
      const { data } = await supabase.auth.getSession();
      const userId = data?.session?.user?.id || null;
      
      // Calculate total
      set((state) => {
        const total = products.reduce((sum, item) => {
          const product = state.products.find(p => p.id === item.productId);
          return sum + (product?.price || 0) * item.quantity;
        }, 0);
        
        return {
          sales: [...state.sales, {
            id: crypto.randomUUID(),
            products,
            total,
            paymentMethod,
            date: new Date(),
            user_id: userId
          }]
        };
      });
    } catch (error) {
      console.error("Error adding sale:", error);
    }
  },
  
  // New function to add retroactive sales with custom date
  addRetroactiveSale: async (products: { productId: string, quantity: number }[], paymentMethod: string, customDate: Date) => {
    try {
      // Get the current user session
      const { data } = await supabase.auth.getSession();
      const userId = data?.session?.user?.id || null;
      
      // Calculate total
      set((state) => {
        const total = products.reduce((sum, item) => {
          const product = state.products.find(p => p.id === item.productId);
          return sum + (product?.price || 0) * item.quantity;
        }, 0);
        
        return {
          sales: [...state.sales, {
            id: crypto.randomUUID(),
            products,
            total,
            paymentMethod,
            date: customDate,
            user_id: userId
          }]
        };
      });
    } catch (error) {
      console.error("Error adding retroactive sale:", error);
    }
  }
});
