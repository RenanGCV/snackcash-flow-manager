
import { defaultPaymentMethods } from './defaults';
import { StoreState } from './types';

export const createPaymentMethodActions = (set: (fn: (state: StoreState) => Partial<StoreState>) => void) => ({
  addPaymentMethod: (method: string) =>
    set((state) => ({
      paymentMethods: state.paymentMethods.includes(method) 
        ? state.paymentMethods 
        : [...state.paymentMethods, method]
    })),
  
  updatePaymentMethod: (oldMethod: string, newMethod: string) =>
    set((state) => {
      // Don't update if the new method already exists
      if (state.paymentMethods.includes(newMethod) && oldMethod !== newMethod) {
        return { paymentMethods: state.paymentMethods };
      }
      
      // Update the payment method
      return {
        paymentMethods: state.paymentMethods.map(method => 
          method === oldMethod ? newMethod : method
        ),
        // Also update payment method in existing sales
        sales: state.sales.map(sale => 
          sale.paymentMethod === oldMethod 
            ? { ...sale, paymentMethod: newMethod } 
            : sale
        )
      };
    }),
    
  removePaymentMethod: (method: string) =>
    set((state) => {
      // Don't remove default payment methods
      if (defaultPaymentMethods.includes(method)) {
        return { paymentMethods: state.paymentMethods };
      }
      
      return {
        paymentMethods: state.paymentMethods.filter(m => m !== method)
      };
    }),
});
