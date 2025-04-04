
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StoreState } from './types';
import { defaultPaymentMethods, defaultExpenseTags } from './defaults';
import { createProductActions } from './product-actions';
import { createSaleActions } from './sale-actions';
import { createExpenseActions } from './expense-actions';
import { createPaymentMethodActions } from './payment-method-actions';
import { createTagActions } from './tag-actions';
import { supabase } from '@/integrations/supabase/client';

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      products: [],
      sales: [],
      expenses: [],
      paymentMethods: defaultPaymentMethods,
      expenseTags: defaultExpenseTags,
      
      // Initialize data from Supabase
      initializeStore: async () => {
        try {
          // Check if user is authenticated
          const { data } = await supabase.auth.getSession();
          if (!data?.session?.user) return;
          
          // Load data from Supabase (define these functions in their respective action files)
          const actions = get();
          await Promise.all([
            actions.fetchProducts(),
            actions.fetchSales(),
            actions.fetchExpenses(),
            actions.fetchPaymentMethods(),
            actions.fetchExpenseTags()
          ]);
          
          console.log('Store initialized with data from Supabase');
        } catch (error) {
          console.error('Error initializing store:', error);
        }
      },
      
      // Spread actions from separate files
      ...createProductActions(set, get),
      ...createSaleActions(set, get),
      ...createExpenseActions(set, get),
      ...createPaymentMethodActions(set, get),
      ...createTagActions(set, get),
    }),
    {
      name: 'snackcash-storage'
    }
  )
);

// Initialize store when auth state changes
supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_IN') {
    const { initializeStore } = useStore.getState();
    initializeStore();
  }
});

// Re-export from types
export * from './types';
