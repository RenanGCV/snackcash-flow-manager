
import { useState } from 'react';
import { useStore } from '../../data/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit, Trash2, Plus } from 'lucide-react';

// Mapeamento de valores para labels das formas de pagamento
const paymentMethodLabels: Record<string, string> = {
  'cash': 'Dinheiro',
  'credit': 'Cartão de Crédito',
  'debit': 'Cartão de Débito',
  'pix': 'Pix',
  'other': 'Outro',
};

// Função para obter o label de uma forma de pagamento
const getPaymentMethodLabel = (method: string) => {
  return paymentMethodLabels[method] || method;
};

// Opções padrão que não podem ser removidas
const defaultMethods = ['cash', 'credit', 'debit', 'pix', 'other'];

const PaymentMethodsManager = () => {
  const { paymentMethods, addPaymentMethod, removePaymentMethod, updatePaymentMethod } = useStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState('');
  const [editingMethod, setEditingMethod] = useState({ original: '', new: '' });
  
  const handleAddPaymentMethod = () => {
    if (newPaymentMethod.trim()) {
      addPaymentMethod(newPaymentMethod.trim());
      toast.success(`Forma de pagamento "${newPaymentMethod}" adicionada com sucesso!`);
      setNewPaymentMethod('');
      setIsAddDialogOpen(false);
    } else {
      toast.error('O nome da forma de pagamento não pode estar vazio.');
    }
  };
  
  const handleEditPaymentMethod = () => {
    if (editingMethod.new.trim()) {
      updatePaymentMethod(editingMethod.original, editingMethod.new.trim());
      toast.success(`Forma de pagamento atualizada com sucesso!`);
      setEditingMethod({ original: '', new: '' });
      setIsEditDialogOpen(false);
    } else {
      toast.error('O nome da forma de pagamento não pode estar vazio.');
    }
  };
  
  const handleRemovePaymentMethod = (method: string) => {
    if (defaultMethods.includes(method)) {
      toast.error('Não é possível remover formas de pagamento padrão.');
      return;
    }
    
    removePaymentMethod(method);
    toast.success(`Forma de pagamento "${getPaymentMethodLabel(method)}" removida com sucesso!`);
  };
  
  const startEditing = (method: string) => {
    setEditingMethod({ 
      original: method, 
      new: method 
    });
    setIsEditDialogOpen(true);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Formas de Pagamento</h2>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Plus className="h-4 w-4" /> Adicionar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Forma de Pagamento</DialogTitle>
              <DialogDescription>
                Adicione uma nova forma de pagamento para as vendas.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="Ex: Voucher, Transferência"
                value={newPaymentMethod}
                onChange={(e) => setNewPaymentMethod(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" onClick={handleAddPaymentMethod}>Adicionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="w-[100px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentMethods.map((method) => (
              <TableRow key={method}>
                <TableCell>{getPaymentMethodLabel(method)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => startEditing(method)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleRemovePaymentMethod(method)}
                      disabled={defaultMethods.includes(method)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Forma de Pagamento</DialogTitle>
            <DialogDescription>
              Altere o nome da forma de pagamento.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Novo nome"
              value={editingMethod.new}
              onChange={(e) => setEditingMethod({ ...editingMethod, new: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleEditPaymentMethod}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentMethodsManager;
