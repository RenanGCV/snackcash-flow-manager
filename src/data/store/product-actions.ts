
import { supabase } from '@/integrations/supabase/client';
import { StoreState } from './types';
import { toast } from 'sonner';

export const createProductActions = (set: (fn: (state: StoreState) => Partial<StoreState>) => void, get: () => StoreState) => ({
  // Fetch products from Supabase
  fetchProducts: async () => {
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      // Transform the data to match our expected format
      const formattedProducts = products.map(product => ({
        ...product,
        createdAt: new Date(product.created_at),
        updatedAt: new Date(product.updated_at),
        price: Number(product.price) // Ensure price is a number
      }));
      
      set(() => ({ products: formattedProducts }));
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Erro ao carregar produtos");
    }
  },
  
  addProduct: async (product: any) => {
    try {
      // Get the session to check if user is authenticated
      const { data } = await supabase.auth.getSession();
      const userId = data?.session?.user?.id;
      
      if (!userId) {
        toast.error("Você precisa estar logado para adicionar produtos");
        return;
      }
      
      // Create the product with the user_id
      const newProduct = {
        ...product,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: userId,
      };
      
      // Save to Supabase
      const { error } = await supabase
        .from('products')
        .insert(newProduct);
      
      if (error) throw error;
      
      // Update local state
      set((state) => ({
        products: [...state.products, {
          ...product,
          id: newProduct.id,
          createdAt: new Date(newProduct.created_at),
          updatedAt: new Date(newProduct.updated_at),
          user_id: userId
        }]
      }));
      
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Erro ao adicionar produto");
    }
  },
  
  updateProduct: async (id: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
      
      set((state) => ({
        products: state.products.map(product => 
          product.id === id 
            ? { ...product, ...updates, updatedAt: new Date() } 
            : product
        )
      }));
      
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Erro ao atualizar produto");
    }
  },
  
  deleteProduct: async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      set((state) => ({
        products: state.products.filter(product => product.id !== id)
      }));
      
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Erro ao excluir produto");
    }
  },
});
