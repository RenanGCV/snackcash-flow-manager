
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StoreState } from './types';
import { defaultPaymentMethods, defaultExpenseTags } from './defaults';
import { createProductActions } from './product-actions';
import { createSaleActions } from './sale-actions';
import { createExpenseActions } from './expense-actions';
import { createPaymentMethodActions } from './payment-method-actions';
import { createTagActions } from './tag-actions';

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      products: [],
      sales: [],
      expenses: [],
      paymentMethods: defaultPaymentMethods,
      expenseTags: defaultExpenseTags,
      
      // Spread actions from separate files
      ...createProductActions(set),
      ...createSaleActions(set),
      ...createExpenseActions(set),
      ...createPaymentMethodActions(set),
      ...createTagActions(set),
    }),
    {
      name: 'snackcash-storage'
    }
  )
);

// Re-export from types
export * from './types';
