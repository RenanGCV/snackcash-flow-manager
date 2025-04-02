
import { useState } from 'react';
import Layout from '../components/Layout';
import ProductList from '../components/products/ProductList';
import ProductForm from '../components/products/ProductForm';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const Products = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Produtos</h1>
            <p className="text-muted-foreground">
              Gerencie os produtos vendidos na sua lanchonete.
            </p>
          </div>
          
          <Button onClick={() => setIsAddDialogOpen(true)} className="sm:self-start">
            <Plus className="h-4 w-4 mr-2" /> Novo Produto
          </Button>
        </div>
        
        <ProductList />
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Produto</DialogTitle>
            </DialogHeader>
            <ProductForm onSave={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Products;
