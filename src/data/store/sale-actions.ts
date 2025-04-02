
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
  },
  
  // New function to edit existing sales
  editSale: async (id: string, updates: { products?: { productId: string, quantity: number }[], paymentMethod?: string, date?: Date }) => {
    try {
      set((state) => {
        const sale = state.sales.find(s => s.id === id);
        if (!sale) return { sales: state.sales };
        
        // Calculate new total if products are updated
        let newTotal = sale.total;
        if (updates.products) {
          newTotal = updates.products.reduce((sum, item) => {
            const product = state.products.find(p => p.id === item.productId);
            return sum + (product?.price || 0) * item.quantity;
          }, 0);
        }
        
        const updatedSales = state.sales.map(s => {
          if (s.id === id) {
            return {
              ...s,
              products: updates.products || s.products,
              total: newTotal,
              paymentMethod: updates.paymentMethod || s.paymentMethod,
              date: updates.date || s.date
            };
          }
          return s;
        });
        
        return { sales: updatedSales };
      });
    } catch (error) {
      console.error("Error editing sale:", error);
    }
  },
  
  // New function to delete sales
  deleteSale: async (id: string) => {
    try {
      set((state) => ({
        sales: state.sales.filter(s => s.id !== id)
      }));
    } catch (error) {
      console.error("Error deleting sale:", error);
    }
  }
});
