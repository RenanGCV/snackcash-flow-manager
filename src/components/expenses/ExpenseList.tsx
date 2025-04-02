
import { useState } from 'react';
import { useStore } from '../../data/store';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash, CalendarRange } from 'lucide-react';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ExpenseFormWithTags from './ExpenseFormWithTags';
import { Expense } from '../../data/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const ExpenseList = () => {
  const { expenses, deleteExpense } = useStore();
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  
  const handleDelete = (id: string, description: string) => {
    deleteExpense(id);
    toast.success(`Despesa "${description}" excluída com sucesso!`);
  };
  
  return (
    <div className="space-y-4">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {expenses.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="hidden md:table-cell">Tags</TableHead>
                <TableHead className="hidden md:table-cell">Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {expense.description}
                      {expense.isRecurring && expense.recurrenceDay && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <CalendarRange className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Despesa recorrente: dia {expense.recurrenceDay} de cada mês</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>R$ {expense.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={expense.category === 'fixed' ? 'secondary' : 'outline'}>
                      {expense.category === 'fixed' ? 'Fixa' : 'Variável'}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {expense.tags?.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                    {format(new Date(expense.date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setEditingExpense(expense)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Confirmar exclusão</DialogTitle>
                            <DialogDescription>
                              Tem certeza que deseja excluir a despesa "{expense.description}"? Esta ação não pode ser desfeita.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Cancelar</Button>
                            </DialogClose>
                            <Button
                              variant="destructive"
                              onClick={() => handleDelete(expense.id, expense.description)}
                            >
                              Excluir
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Nenhuma despesa cadastrada ainda.</p>
          </div>
        )}
      </div>
      
      <Dialog open={!!editingExpense} onOpenChange={(open) => !open && setEditingExpense(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Despesa</DialogTitle>
          </DialogHeader>
          {editingExpense && (
            <ExpenseFormWithTags expense={editingExpense} onSave={() => setEditingExpense(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpenseList;
