
import { useState } from 'react';
import Layout from '../components/Layout';
import ExpenseList from '../components/expenses/ExpenseList';
import ExpenseForm from '../components/expenses/ExpenseForm';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const Expenses = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Despesas</h1>
            <p className="text-muted-foreground">
              Registre e gerencie as despesas da sua lanchonete.
            </p>
          </div>
          
          <Button onClick={() => setIsAddDialogOpen(true)} className="sm:self-start">
            <Plus className="h-4 w-4 mr-2" /> Nova Despesa
          </Button>
        </div>
        
        <ExpenseList />
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Despesa</DialogTitle>
            </DialogHeader>
            <ExpenseForm onSave={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Expenses;
