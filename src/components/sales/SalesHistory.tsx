
import { useState } from 'react';
import { useStore } from '../../data/store';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Sale } from '../../data/types';
import { Edit, Trash, Calendar, Search } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

// Payment method labels mapping
const paymentMethodLabels: Record<string, string> = {
  'cash': 'Dinheiro',
  'credit': 'Cartão de Crédito',
  'debit': 'Cartão de Débito',
  'pix': 'Pix',
  'other': 'Outro',
};

const SalesHistory = () => {
  const { sales, products, paymentMethods, editSale, deleteSale } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Edit form state
  const [editItems, setEditItems] = useState<{ productId: string; quantity: number }[]>([]);
  const [editPaymentMethod, setEditPaymentMethod] = useState('');
  const [editDate, setEditDate] = useState<Date | undefined>(undefined);
  
  // Function to get the label for a payment method
  const getPaymentMethodLabel = (method: string) => {
    return paymentMethodLabels[method] || method;
  };
  
  // Filter sales based on search query
  const filteredSales = sales
    .filter(sale => {
      if (!searchQuery) return true;
      
      // Convert search query to lowercase for case-insensitive comparison
      const query = searchQuery.toLowerCase();
      
      // Check if payment method matches
      const paymentMethod = getPaymentMethodLabel(sale.paymentMethod).toLowerCase();
      if (paymentMethod.includes(query)) return true;
      
      // Check if date matches (formatted as string)
      const dateStr = format(new Date(sale.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }).toLowerCase();
      if (dateStr.includes(query)) return true;
      
      // Check if total matches
      const totalStr = sale.total.toString();
      if (totalStr.includes(query)) return true;
      
      // Check if any product name matches
      const productMatches = sale.products.some(item => {
        const product = products.find(p => p.id === item.productId);
        return product?.name.toLowerCase().includes(query);
      });
      
      return productMatches;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const handleEditClick = (sale: Sale) => {
    setSelectedSale(sale);
    setEditItems([...sale.products]);
    setEditPaymentMethod(sale.paymentMethod);
    setEditDate(new Date(sale.date));
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteClick = (sale: Sale) => {
    setSelectedSale(sale);
    setIsDeleteDialogOpen(true);
  };
  
  const handleEditSave = () => {
    if (!selectedSale) return;
    
    // Validate form
    if (editItems.length === 0) {
      toast.error('Adicione pelo menos um produto');
      return;
    }
    
    if (editItems.some(item => !item.productId)) {
      toast.error('Selecione um produto para cada item');
      return;
    }
    
    if (!editPaymentMethod) {
      toast.error('Selecione uma forma de pagamento');
      return;
    }
    
    if (!editDate) {
      toast.error('Selecione uma data');
      return;
    }
    
    // Save changes
    editSale(selectedSale.id, {
      products: editItems,
      paymentMethod: editPaymentMethod,
      date: editDate
    });
    
    toast.success('Venda atualizada com sucesso!');
    setIsEditDialogOpen(false);
  };
  
  const handleDeleteConfirm = () => {
    if (!selectedSale) return;
    
    deleteSale(selectedSale.id);
    toast.success('Venda excluída com sucesso!');
    setIsDeleteDialogOpen(false);
  };
  
  const handleAddItem = () => {
    setEditItems([...editItems, { productId: '', quantity: 1 }]);
  };
  
  const handleRemoveItem = (index: number) => {
    if (editItems.length <= 1) return;
    setEditItems(editItems.filter((_, i) => i !== index));
  };
  
  const handleItemChange = (index: number, field: 'productId' | 'quantity', value: string | number) => {
    const newItems = [...editItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setEditItems(newItems);
  };
  
  const calculateTotal = (items: { productId: string; quantity: number }[]) => {
    return items.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      return sum + (product?.price || 0) * item.quantity;
    }, 0);
  };
  
  const formatProductsList = (sale: Sale) => {
    return sale.products.map(item => {
      const product = products.find(p => p.id === item.productId);
      return `${product?.name || 'Produto desconhecido'} (${item.quantity}x)`;
    }).join(', ');
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar vendas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      
      {filteredSales.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Produtos</TableHead>
                <TableHead>Forma de Pagamento</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>{format(new Date(sale.date), "dd/MM/yyyy")}</TableCell>
                  <TableCell className="max-w-[300px] truncate" title={formatProductsList(sale)}>
                    {formatProductsList(sale)}
                  </TableCell>
                  <TableCell>{getPaymentMethodLabel(sale.paymentMethod)}</TableCell>
                  <TableCell className="text-right font-medium">R$ {sale.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(sale)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(sale)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-10 bg-white rounded-md border">
          <p className="text-muted-foreground">Nenhuma venda encontrada.</p>
          {searchQuery && (
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => setSearchQuery('')}
            >
              Limpar busca
            </Button>
          )}
        </div>
      )}
      
      {/* Edit Sale Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Venda</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 my-4">
            <div className="space-y-4">
              {editItems.map((item, index) => (
                <div key={index} className="flex items-end gap-2">
                  <div className="flex-1">
                    <Label htmlFor={`edit-product-${index}`}>Produto</Label>
                    <Select
                      value={item.productId}
                      onValueChange={(value) => handleItemChange(index, 'productId', value)}
                    >
                      <SelectTrigger id={`edit-product-${index}`}>
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
                  
                  <div className="w-20">
                    <Label htmlFor={`edit-quantity-${index}`}>Qtd</Label>
                    <Input
                      id={`edit-quantity-${index}`}
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                    />
                  </div>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(index)}
                    disabled={editItems.length <= 1}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                className="w-full"
              >
                Adicionar Item
              </Button>
            </div>
            
            <div>
              <Label>Forma de Pagamento</Label>
              <Select
                value={editPaymentMethod}
                onValueChange={setEditPaymentMethod}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma forma de pagamento" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {getPaymentMethodLabel(method)}
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
                    <Calendar className="mr-2 h-4 w-4" />
                    {editDate
                      ? format(editDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                      : <span>Selecione uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={editDate}
                    onSelect={(date) => date && setEditDate(date)}
                    locale={ptBR}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total:</span>
                <span className="text-lg font-bold">
                  R$ {calculateTotal(editItems).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditSave}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Tem certeza que deseja excluir esta venda? Esta ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesHistory;
