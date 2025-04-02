
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
}

export type PaymentMethod = 'cash' | 'credit' | 'debit' | 'pix' | 'other';

export interface AppState {
  products: Product[];
  sales: Sale[];
  expenses: Expense[];
}
