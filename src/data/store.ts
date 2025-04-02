
import { create } from 'zustand';
import { AppState, Product, Sale, Expense, PaymentMethod } from './types';
import { persist } from 'zustand/middleware';

interface StoreState extends AppState {
  // Product actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, updates: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteProduct: (id: string) => void;
  
  // Sale actions
  addSale: (products: { productId: string, quantity: number }[], paymentMethod: PaymentMethod) => void;
  
  // Expense actions
  addExpense: (expense: Omit<Expense, 'id' | 'date'>) => void;
  updateExpense: (id: string, updates: Partial<Omit<Expense, 'id' | 'date'>>) => void;
  deleteExpense: (id: string) => void;
  
  // Payment method actions
  addPaymentMethod: (method: string) => void;
  updatePaymentMethod: (oldMethod: string, newMethod: string) => void;
  removePaymentMethod: (method: string) => void;
  
  // Tag actions
  addExpenseTag: (tag: string) => void;
  updateExpenseTag: (oldTag: string, newTag: string) => void;
  removeExpenseTag: (tag: string) => void;
}

// Predefined payment methods
const defaultPaymentMethods = ['cash', 'credit', 'debit', 'pix', 'other'];

// Predefined expense tags
const defaultExpenseTags = ['food', 'supplies', 'maintenance', 'utilities', 'rent', 'taxes', 'other'];

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      products: [],
      sales: [],
      expenses: [],
      paymentMethods: defaultPaymentMethods,
      expenseTags: defaultExpenseTags,
      
      // Product actions
      addProduct: (product) => 
        set((state) => ({
          products: [...state.products, {
            ...product,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date()
          }]
        })),
      
      updateProduct: (id, updates) => 
        set((state) => ({
          products: state.products.map(product => 
            product.id === id 
              ? { ...product, ...updates, updatedAt: new Date() } 
              : product
          )
        })),
      
      deleteProduct: (id) => 
        set((state) => ({
          products: state.products.filter(product => product.id !== id)
        })),
      
      // Sale actions
      addSale: (products, paymentMethod) => 
        set((state) => {
          // Calculate total
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
              date: new Date()
            }]
          };
        }),
      
      // Expense actions
      addExpense: (expense) => 
        set((state) => ({
          expenses: [...state.expenses, {
            ...expense,
            id: crypto.randomUUID(),
            date: new Date()
          }]
        })),
      
      updateExpense: (id, updates) => 
        set((state) => ({
          expenses: state.expenses.map(expense => 
            expense.id === id 
              ? { ...expense, ...updates } 
              : expense
          )
        })),
      
      deleteExpense: (id) => 
        set((state) => ({
          expenses: state.expenses.filter(expense => expense.id !== id)
        })),
        
      // Payment method actions
      addPaymentMethod: (method) =>
        set((state) => ({
          paymentMethods: state.paymentMethods.includes(method) 
            ? state.paymentMethods 
            : [...state.paymentMethods, method]
        })),
      
      updatePaymentMethod: (oldMethod, newMethod) =>
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
        
      removePaymentMethod: (method) =>
        set((state) => {
          // Don't remove default payment methods
          if (defaultPaymentMethods.includes(method)) {
            return { paymentMethods: state.paymentMethods };
          }
          
          return {
            paymentMethods: state.paymentMethods.filter(m => m !== method)
          };
        }),
        
      // Tag actions
      addExpenseTag: (tag) =>
        set((state) => ({
          expenseTags: state.expenseTags.includes(tag) 
            ? state.expenseTags 
            : [...state.expenseTags, tag]
        })),
        
      updateExpenseTag: (oldTag, newTag) =>
        set((state) => {
          // Don't update if the new tag already exists
          if (state.expenseTags.includes(newTag) && oldTag !== newTag) {
            return { expenseTags: state.expenseTags };
          }
          
          // Update the tag
          return {
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
          };
        }),
        
      removeExpenseTag: (tag) =>
        set((state) => {
          // Don't remove default tags
          if (defaultExpenseTags.includes(tag)) {
            return { expenseTags: state.expenseTags };
          }
          
          return {
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
          };
        }),
    }),
    {
      name: 'snackcash-storage'
    }
  )
);
