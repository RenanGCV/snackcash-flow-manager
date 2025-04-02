
import { useState } from 'react';
import { useStore } from '../../data/store';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Expense } from '../../data/types';
import { toast } from 'sonner';

const formSchema = z.object({
  description: z.string().min(1, { message: 'Descrição é obrigatória' }),
  amount: z.coerce.number().min(0.01, { message: 'Valor deve ser maior que zero' }),
  category: z.enum(['fixed', 'variable']),
});

type FormValues = z.infer<typeof formSchema>;

interface ExpenseFormProps {
  expense?: Expense;
  onSave?: () => void;
}

const ExpenseForm = ({ expense, onSave }: ExpenseFormProps) => {
  const { addExpense, updateExpense } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: expense?.description || '',
      amount: expense?.amount || 0,
      category: expense?.category || 'variable',
    },
  });
  
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
          category: values.category
        });
        toast.success(`Despesa "${values.description}" adicionada com sucesso!`);
        form.reset({
          description: '',
          amount: 0,
          category: 'variable',
        });
      }
      
      if (onSave) {
        onSave();
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
