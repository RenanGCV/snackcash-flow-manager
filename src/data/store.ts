
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
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      products: [],
      sales: [],
      expenses: [],
      
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
    }),
    {
      name: 'snackcash-storage'
    }
  )
);
