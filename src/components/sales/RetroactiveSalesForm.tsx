
import { useState } from 'react';
import { useStore } from '../../data/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Calendar as CalendarIcon, Plus, Minus, Trash } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const RetroactiveSalesForm = () => {
  const { products, paymentMethods, addRetroactiveSale } = useStore();
  const [items, setItems] = useState<{ productId: string; quantity: number }[]>([{ productId: '', quantity: 1 }]);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [total, setTotal] = useState(0);

  const calculateTotal = (newItems: { productId: string; quantity: number }[]) => {
    return newItems.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      return sum + (product?.price || 0) * item.quantity;
    }, 0);
  };

  const handleAddItem = () => {
    const newItems = [...items, { productId: '', quantity: 1 }];
    setItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) {
      return;
    }
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    setTotal(calculateTotal(newItems));
  };

  const handleQuantityChange = (index: number, value: number) => {
    if (value < 1) return;
    
    const newItems = [...items];
    newItems[index].quantity = value;
    setItems(newItems);
    setTotal(calculateTotal(newItems));
  };

  const handleProductChange = (index: number, productId: string) => {
    const newItems = [...items];
    newItems[index].productId = productId;
    setItems(newItems);
    setTotal(calculateTotal(newItems));
  };

  const handleSubmit = () => {
    if (!paymentMethod) {
      toast.error('Selecione um método de pagamento');
      return;
    }

    const validItems = items.filter(item => item.productId !== '');
    if (validItems.length === 0) {
      toast.error('Adicione pelo menos um produto');
      return;
    }

    addRetroactiveSale(validItems, paymentMethod, date);
    toast.success('Venda retroativa registrada com sucesso!');
    
    // Reset form
    setItems([{ productId: '', quantity: 1 }]);
    setPaymentMethod('');
    setTotal(0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Venda Retroativa</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-grow">
                <Label htmlFor={`product-${index}`}>Produto</Label>
                <Select 
                  value={item.productId} 
                  onValueChange={(value) => handleProductChange(index, value)}
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
              
              <div className="w-36">
                <Label htmlFor={`quantity-${index}`}>Qtd</Label>
                <div className="flex items-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-r-none"
                    onClick={() => handleQuantityChange(index, item.quantity - 1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                    className="h-10 text-center rounded-none w-16"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-l-none"
                    onClick={() => handleQuantityChange(index, item.quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-end pb-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveItem(index)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            className="w-full mt-2"
            onClick={handleAddItem}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Produto
          </Button>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="payment-method">Forma de Pagamento</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger id="payment-method">
                <SelectValue placeholder="Selecione uma forma de pagamento" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Data da Venda</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal mt-1"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : <span>Selecione uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-medium">Total:</span>
            <span className="text-xl font-bold">R$ {total.toFixed(2)}</span>
          </div>
          
          <Button className="w-full" onClick={handleSubmit}>
            Registrar Venda Retroativa
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RetroactiveSalesForm;
