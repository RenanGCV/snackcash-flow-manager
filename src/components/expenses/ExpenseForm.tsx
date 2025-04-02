
import { useState, useEffect } from 'react';
import { useStore } from '../../data/store';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Expense } from '../../data/types';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const formSchema = z.object({
  description: z.string().min(1, { message: 'Descrição é obrigatória' }),
  amount: z.coerce.number().min(0.01, { message: 'Valor deve ser maior que zero' }),
  category: z.enum(['fixed', 'variable']),
  isRecurring: z.boolean().default(false),
  recurrenceDay: z.number().min(1).max(31).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ExpenseFormProps {
  expense?: Expense;
  onSave: (expense: Expense) => void;
}

const ExpenseForm = ({ expense, onSave }: ExpenseFormProps) => {
  const { addExpense, updateExpense } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: expense?.description || '',
      amount: expense?.amount || 0,
      category: expense?.category || 'variable',
      isRecurring: expense?.isRecurring || false,
      recurrenceDay: expense?.recurrenceDay || undefined,
    },
  });
  
  // Observe selected date changes to update recurrenceDay
  useEffect(() => {
    if (selectedDate) {
      const day = selectedDate.getDate();
      form.setValue('recurrenceDay', day);
    }
  }, [selectedDate, form]);
  
  // Initialize selected date from the expense
  useEffect(() => {
    if (expense?.recurrenceDay) {
      // Create a date for the current month with the recurrence day
      const today = new Date();
      const initialDate = new Date(today.getFullYear(), today.getMonth(), expense.recurrenceDay);
      setSelectedDate(initialDate);
    }
  }, [expense]);
  
  const showRecurringOptions = form.watch('category') === 'fixed';
  const isRecurring = form.watch('isRecurring');
  
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      if (expense) {
        updateExpense(expense.id, values);
        toast.success(`Despesa "${values.description}" atualizada com sucesso!`);
      } else {
        // Ensure all required fields are present before calling addExpense
        addExpense({
          description: values.description,
          amount: values.amount,
          category: values.category,
          isRecurring: values.category === 'fixed' ? values.isRecurring : false,
          recurrenceDay: values.category === 'fixed' && values.isRecurring ? values.recurrenceDay : undefined,
        });
        toast.success(`Despesa "${values.description}" adicionada com sucesso!`);
        form.reset({
          description: '',
          amount: 0,
          category: 'variable',
          isRecurring: false,
          recurrenceDay: undefined,
        });
        setSelectedDate(undefined);
      }
      
      if (onSave) {
        // Call onSave with the current expense or a newly created one
        const savedExpense: Expense = expense || {
          id: 'temp-id', // This ID will be replaced by the real one in the store
          description: values.description,
          amount: values.amount,
          category: values.category,
          date: new Date(),
          isRecurring: values.category === 'fixed' ? values.isRecurring : false,
          recurrenceDay: values.category === 'fixed' && values.isRecurring ? values.recurrenceDay : undefined,
        };
        onSave(savedExpense);
      }
    } catch (error) {
      toast.error('Erro ao salvar despesa. Tente novamente.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Aluguel" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor (R$)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  min="0.01"
                  placeholder="0.00" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Categoria</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-4"
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="fixed" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">Fixa</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="variable" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">Variável</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {showRecurringOptions && (
          <>
            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Despesa recorrente</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Repetir automaticamente todos os meses
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {isRecurring && (
              <FormField
                control={form.control}
                name="recurrenceDay"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de recorrência</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !selectedDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? (
                              format(selectedDate, "'Dia' dd 'de cada mês'", { locale: ptBR })
                            ) : (
                              <span>Selecione o dia do mês</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      Selecione o dia em que a despesa será recorrente.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </>
        )}
        
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : expense ? 'Atualizar' : 'Adicionar'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ExpenseForm;
