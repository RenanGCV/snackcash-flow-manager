
import { supabase } from '@/integrations/supabase/client';
import { StoreState } from './types';
import { toast } from 'sonner';

export const createSaleActions = (set: (fn: (state: StoreState) => Partial<StoreState>) => void, get: () => StoreState) => ({
  // Fetch sales from Supabase
  fetchSales: async () => {
    try {
      // Fetch sales
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .order('date', { ascending: false });
      
      if (salesError) throw salesError;
      
      // Fetch sales items for each sale
      const salesWithItems = await Promise.all(sales.map(async (sale) => {
        const { data: items, error: itemsError } = await supabase
          .from('sales_items')
          .select('id, product_id, quantity')
          .eq('sale_id', sale.id);
        
        if (itemsError) throw itemsError;
        
        return {
          ...sale,
          id: sale.id,
          products: items.map(item => ({
            productId: item.product_id,
            quantity: item.quantity
          })),
          total: Number(sale.total),
          paymentMethod: sale.payment_method,
          date: new Date(sale.date)
        };
      }));
      
      set(() => ({ sales: salesWithItems }));
      
    } catch (error) {
      console.error("Error fetching sales:", error);
      toast.error("Erro ao carregar vendas");
    }
  },
  
  addSale: async (products: { productId: string, quantity: number }[], paymentMethod: string) => {
    try {
      // Get the session to check if user is authenticated
      const { data } = await supabase.auth.getSession();
      const userId = data?.session?.user?.id;
      
      if (!userId) {
        toast.error("Você precisa estar logado para registrar vendas");
        return;
      }
      
      // Calculate total
      const state = get();
      const total = products.reduce((sum, item) => {
        const product = state.products.find(p => p.id === item.productId);
        return sum + (product?.price || 0) * item.quantity;
      }, 0);
      
      // Create sale record
      const saleId = crypto.randomUUID();
      const saleData = {
        id: saleId,
        total,
        payment_method: paymentMethod,
        date: new Date().toISOString(),
        user_id: userId
      };
      
      // Save sale to Supabase
      const { error: saleError } = await supabase
        .from('sales')
        .insert(saleData);
      
      if (saleError) throw saleError;
      
      // Save sale items
      const saleItems = products.map(item => ({
        id: crypto.randomUUID(),
        sale_id: saleId,
        product_id: item.productId,
        quantity: item.quantity
      }));
      
      const { error: itemsError } = await supabase
        .from('sales_items')
        .insert(saleItems);
      
      if (itemsError) throw itemsError;
      
      // Update local state
      set((state) => ({
        sales: [...state.sales, {
          id: saleId,
          products,
          total,
          paymentMethod,
          date: new Date(),
          user_id: userId
        }]
      }));
      
    } catch (error) {
      console.error("Error adding sale:", error);
      toast.error("Erro ao registrar venda");
    }
  },
  
  addRetroactiveSale: async (products: { productId: string, quantity: number }[], paymentMethod: string, customDate: Date) => {
    try {
      // Get the session to check if user is authenticated
      const { data } = await supabase.auth.getSession();
      const userId = data?.session?.user?.id;
      
      if (!userId) {
        toast.error("Você precisa estar logado para registrar vendas retroativas");
        return;
      }
      
      // Calculate total
      const state = get();
      const total = products.reduce((sum, item) => {
        const product = state.products.find(p => p.id === item.productId);
        return sum + (product?.price || 0) * item.quantity;
      }, 0);
      
      // Create sale record
      const saleId = crypto.randomUUID();
      const saleData = {
        id: saleId,
        total,
        payment_method: paymentMethod,
        date: customDate.toISOString(),
        user_id: userId
      };
      
      // Save sale to Supabase
      const { error: saleError } = await supabase
        .from('sales')
        .insert(saleData);
      
      if (saleError) throw saleError;
      
      // Save sale items
      const saleItems = products.map(item => ({
        id: crypto.randomUUID(),
        sale_id: saleId,
        product_id: item.productId,
        quantity: item.quantity
      }));
      
      const { error: itemsError } = await supabase
        .from('sales_items')
        .insert(saleItems);
      
      if (itemsError) throw itemsError;
      
      // Update local state
      set((state) => ({
        sales: [...state.sales, {
          id: saleId,
          products,
          total,
          paymentMethod,
          date: customDate,
          user_id: userId
        }]
      }));
      
    } catch (error) {
      console.error("Error adding retroactive sale:", error);
      toast.error("Erro ao registrar venda retroativa");
    }
  },
  
  editSale: async (id: string, updates: { products?: { productId: string, quantity: number }[], paymentMethod?: string, date?: Date }) => {
    try {
      // Update sale in Supabase
      const saleUpdates: any = {};
      if (updates.paymentMethod) saleUpdates.payment_method = updates.paymentMethod;
      if (updates.date) saleUpdates.date = updates.date.toISOString();
      
      if (Object.keys(saleUpdates).length > 0) {
        const { error: saleError } = await supabase
          .from('sales')
          .update(saleUpdates)
          .eq('id', id);
        
        if (saleError) throw saleError;
      }
      
      // Update products if needed
      if (updates.products) {
        // First, delete existing items
        const { error: deleteError } = await supabase
          .from('sales_items')
          .delete()
          .eq('sale_id', id);
        
        if (deleteError) throw deleteError;
        
        // Calculate new total
        const state = get();
        const newTotal = updates.products.reduce((sum, item) => {
          const product = state.products.find(p => p.id === item.productId);
          return sum + (product?.price || 0) * item.quantity;
        }, 0);
        
        // Update total in sale
        const { error: totalError } = await supabase
          .from('sales')
          .update({ total: newTotal })
          .eq('id', id);
        
        if (totalError) throw totalError;
        
        // Insert new items
        const saleItems = updates.products.map(item => ({
          id: crypto.randomUUID(),
          sale_id: id,
          product_id: item.productId,
          quantity: item.quantity
        }));
        
        const { error: insertError } = await supabase
          .from('sales_items')
          .insert(saleItems);
        
        if (insertError) throw insertError;
      }
      
      // Update local state
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
      toast.error("Erro ao editar venda");
    }
  },
  
  deleteSale: async (id: string) => {
    try {
      // First delete sale items (due to foreign key constraint)
      const { error: itemsError } = await supabase
        .from('sales_items')
        .delete()
        .eq('sale_id', id);
      
      if (itemsError) throw itemsError;
      
      // Then delete sale
      const { error: saleError } = await supabase
        .from('sales')
        .delete()
        .eq('id', id);
      
      if (saleError) throw saleError;
      
      // Update local state
      set((state) => ({
        sales: state.sales.filter(s => s.id !== id)
      }));
      
    } catch (error) {
      console.error("Error deleting sale:", error);
      toast.error("Erro ao excluir venda");
    }
  }
});
