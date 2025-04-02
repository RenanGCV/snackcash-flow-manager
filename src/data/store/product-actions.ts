
import { supabase } from '@/integrations/supabase/client';
import { StoreState } from './types';

export const createProductActions = (set: (fn: (state: StoreState) => Partial<StoreState>) => void) => ({
  addProduct: (product: any) => 
    set((state) => {
      const userId = supabase.auth.getSession()
        .then(res => res.data?.session?.user?.id || null);
      
      return {
        products: [...state.products, {
          ...product,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
          user_id: userId
        }]
      };
    }),
  
  updateProduct: (id: string, updates: any) => 
    set((state) => ({
      products: state.products.map(product => 
        product.id === id 
          ? { ...product, ...updates, updatedAt: new Date() } 
          : product
      )
    })),
  
  deleteProduct: (id: string) => 
    set((state) => ({
      products: state.products.filter(product => product.id !== id)
    })),
});
