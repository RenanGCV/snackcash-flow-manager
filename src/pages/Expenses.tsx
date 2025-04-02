
import { useState } from 'react';
import Layout from '../components/Layout';
import ExpenseList from '../components/expenses/ExpenseList';
import ExpenseFormWithTags from '../components/expenses/ExpenseFormWithTags';
import RetroactiveExpenseForm from '../components/expenses/RetroactiveExpenseForm';
import TagManager from '../components/expenses/TagManager';
import { Button } from '@/components/ui/button';
import { Plus, History } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const Expenses = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRetroactiveDialogOpen, setIsRetroactiveDialogOpen] = useState(false);
  
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
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="sm:self-start">
                <Plus className="h-4 w-4 mr-2" /> Nova Despesa
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Despesa atual
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsRetroactiveDialogOpen(true)}>
                <History className="h-4 w-4 mr-2" /> Despesa retroativa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <Tabs defaultValue="list">
          <TabsList>
            <TabsTrigger value="list">Lista de Despesas</TabsTrigger>
            <TabsTrigger value="tags">Gerenciar Tags</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list">
            <ExpenseList />
          </TabsContent>
          
          <TabsContent value="tags">
            <TagManager />
          </TabsContent>
        </Tabs>
        
        {/* Regular expense dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Despesa</DialogTitle>
            </DialogHeader>
            <ExpenseFormWithTags onSave={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
        
        {/* Retroactive expense dialog */}
        <Dialog open={isRetroactiveDialogOpen} onOpenChange={setIsRetroactiveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Despesa Retroativa</DialogTitle>
            </DialogHeader>
            <RetroactiveExpenseForm onSave={() => setIsRetroactiveDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Expenses;
