
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sale {
  id: string;
  products: {
    productId: string;
    quantity: number;
  }[];
  total: number;
  paymentMethod: PaymentMethod;
  date: Date;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: 'fixed' | 'variable';
  date: Date;
  isRecurring?: boolean;
  recurrenceDay?: number;
  tags?: string[]; // Adding tags for expense categorization
}

export type PaymentMethod = 'cash' | 'credit' | 'debit' | 'pix' | 'other' | string;

export interface AppState {
  products: Product[];
  sales: Sale[];
  expenses: Expense[];
  paymentMethods: string[];
  expenseTags: string[]; // Adding expense tags to the app state
}
