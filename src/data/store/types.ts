
// Import types from the main types file
import { Product, Sale, Expense, PaymentMethod, AppState } from '../types';

// Re-export the types
export type { Product, Sale, Expense, PaymentMethod, AppState };

// Store state with actions interface
export interface StoreState extends AppState {
  // Initialize store
  initializeStore: () => Promise<void>;
  
  // Fetch data from Supabase
  fetchProducts: () => Promise<void>;
  fetchSales: () => Promise<void>;
  fetchExpenses: () => Promise<void>;
  fetchPaymentMethods: () => Promise<void>;
  fetchExpenseTags: () => Promise<void>;
  
  // Product actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, updates: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteProduct: (id: string) => void;
  
  // Sale actions
  addSale: (products: { productId: string, quantity: number }[], paymentMethod: PaymentMethod) => void;
  addRetroactiveSale: (products: { productId: string, quantity: number }[], paymentMethod: PaymentMethod, customDate: Date) => void;
  editSale: (id: string, updates: { products?: { productId: string, quantity: number }[], paymentMethod?: string, date?: Date }) => void;
  deleteSale: (id: string) => void;
  
  // Expense actions
  addExpense: (expense: Omit<Expense, 'id' | 'date'> & { tags?: string[] }) => void;
  addRetroactiveExpense: (expense: Omit<Expense, 'id' | 'date'> & { tags?: string[] }, customDate: Date) => void;
  updateExpense: (id: string, updates: Partial<Omit<Expense, 'id' | 'date'> & { tags?: string[] }>) => void;
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
