
import { useState } from 'react';
import { useStore } from '../../data/store';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import ExpenseFormWithTags from './ExpenseFormWithTags';
import { Expense } from '../../data/types';

interface RetroactiveExpenseFormProps {
  onSave?: () => void;
}

const RetroactiveExpenseForm = ({ onSave }: RetroactiveExpenseFormProps) => {
  const { addRetroactiveExpense } = useStore();
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  const handleSave = (expense: Expense) => {
    if (!date) {
      toast.error('Por favor, selecione uma data para a despesa retroativa');
      return;
    }
    
    // We're using a separate action for retroactive expenses
    const { id, date: _, user_id, ...expenseData } = expense;
    addRetroactiveExpense(expenseData, date);
    
    toast.success('Despesa retroativa adicionada com sucesso!');
    if (onSave) onSave();
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="date">Data da Despesa</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? (
                format(date, "PPP", { locale: ptBR })
              ) : (
                <span>Selecione uma data</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <ExpenseFormWithTags onSave={handleSave} />
    </div>
  );
};

export default RetroactiveExpenseForm;
