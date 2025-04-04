
import { useState } from 'react';
import { useStore } from '../../data/store';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PaymentMethod } from '../../data/types';
import { Trash, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';

// Mapeamento de valores para labels das formas de pagamento
const paymentMethodLabels: Record<string, string> = {
  'cash': 'Dinheiro',
  'credit': 'Cartão de Crédito',
  'debit': 'Cartão de Débito',
  'pix': 'Pix',
  'other': 'Outro',
};

interface SaleItem {
  productId: string;
  quantity: number;
}

const formSchema = z.object({
  paymentMethod: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

const SalesForm = () => {
  const { products, addSale, paymentMethods, addPaymentMethod } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<SaleItem[]>([{ productId: '', quantity: 1 }]);
  const [newPaymentMethod, setNewPaymentMethod] = useState('');
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      paymentMethod: 'cash',
    },
  });
  
  const addItem = () => {
    setItems([...items, { productId: '', quantity: 1 }]);
  };
  
  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };
  
  const updateItem = (index: number, field: keyof SaleItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };
  
  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };
  
  const handleAddPaymentMethod = () => {
    if (newPaymentMethod.trim()) {
      addPaymentMethod(newPaymentMethod.trim());
      toast.success(`Forma de pagamento "${newPaymentMethod}" adicionada com sucesso!`);
      setNewPaymentMethod('');
      setIsPaymentDialogOpen(false);
    } else {
      toast.error('O nome da forma de pagamento não pode estar vazio.');
    }
  };
  
  const onSubmit = async (values: FormValues) => {
    // Validate items
    const hasEmptyProduct = items.some(item => !item.productId);
    
    if (hasEmptyProduct) {
      toast.error('Selecione um produto para cada item.');
      return;
    }
    
    if (items.some(item => item.quantity <= 0)) {
      toast.error('A quantidade deve ser maior que zero.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      addSale(items, values.paymentMethod as PaymentMethod);
      toast.success('Venda registrada com sucesso!');
      
      // Reset form
      setItems([{ productId: '', quantity: 1 }]);
      form.reset({
        paymentMethod: 'cash',
      });
    } catch (error) {
      toast.error('Erro ao registrar venda. Tente novamente.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Função para obter o label de uma forma de pagamento
  const getPaymentMethodLabel = (method: string) => {
    return paymentMethodLabels[method] || method;
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="flex gap-3 items-end">
                <div className="flex-1">
                  <label htmlFor={`product-${index}`} className="block text-sm font-medium mb-1">Produto</label>
                  <Select
                    value={item.productId}
                    onValueChange={(value) => updateItem(index, 'productId', value)}
                  >
                    <SelectTrigger id={`product-${index}`}>
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - R$ {product.price.toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-24">
                  <label htmlFor={`quantity-${index}`} className="block text-sm font-medium mb-1">Qtd</label>
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                  />
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItem}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" /> Adicionar item
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="bg-white p-4 shadow rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">Total da venda</h3>
          <div className="text-2xl font-bold">
            R$ {calculateTotal().toFixed(2)}
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forma de pagamento</FormLabel>
                  <div className="flex gap-2">
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Selecione uma forma de pagamento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method} value={method}>
                            {getPaymentMethodLabel(method)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                      <DialogTrigger asChild>
                        <Button type="button" variant="outline" size="icon">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Adicionar Forma de Pagamento</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                          <FormItem>
                            <FormLabel>Nome da forma de pagamento</FormLabel>
                            <Input
                              placeholder="Ex: Voucher, Transferência"
                              value={newPaymentMethod}
                              onChange={(e) => setNewPaymentMethod(e.target.value)}
                            />
                          </FormItem>
                        </div>
                        <DialogFooter>
                          <Button type="button" onClick={handleAddPaymentMethod}>Adicionar</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end pt-2">
              <Button 
                type="submit" 
                disabled={isSubmitting || items.some(item => !item.productId) || calculateTotal() === 0}
                className="w-full md:w-auto"
              >
                {isSubmitting ? 'Processando...' : 'Finalizar Venda'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default SalesForm;
