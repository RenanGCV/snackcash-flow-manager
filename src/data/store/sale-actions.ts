
import { supabase } from '@/integrations/supabase/client';
import { StoreState } from './types';

export const createSaleActions = (set: (fn: (state: StoreState) => Partial<StoreState>) => void) => ({
  addSale: (products: { productId: string, quantity: number }[], paymentMethod: string) => 
    set((state) => {
      // Calculate total
      const total = products.reduce((sum, item) => {
        const product = state.products.find(p => p.id === item.productId);
        return sum + (product?.price || 0) * item.quantity;
      }, 0);
      
      const userId = supabase.auth.getSession()
        .then(res => res.data?.session?.user?.id || null);
      
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
    }),
});
