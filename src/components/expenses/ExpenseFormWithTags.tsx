
import { useState, useEffect } from 'react';
import { useStore } from '../../data/store';
import { Expense } from '../../data/types';
import ExpenseForm from './ExpenseForm';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ExpenseFormWithTagsProps {
  expense?: Expense;
  onSave: () => void;
}

const ExpenseFormWithTags = ({ expense, onSave }: ExpenseFormWithTagsProps) => {
  const { expenseTags, updateExpense } = useStore();
  const [selectedTags, setSelectedTags] = useState<string[]>(expense?.tags || []);
  const [category, setCategory] = useState<'fixed' | 'variable'>(expense?.category || 'variable');
  
  // Filter out already selected tags
  const availableTags = expenseTags.filter(tag => !selectedTags.includes(tag));
  
  const handleAddTag = (tag: string) => {
    setSelectedTags(prev => [...prev, tag]);
  };
  
  const handleRemoveTag = (tag: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tag));
  };
  
  const handleSaveWithTags = (savedExpense: Expense) => {
    // If this is an edit (expense already exists), update with tags
    if (expense) {
      updateExpense(expense.id, { tags: selectedTags });
    }
    
    onSave();
  };
  
  // To observe category changes from the ExpenseForm component
  useEffect(() => {
    if (expense) {
      setCategory(expense.category);
    }
  }, [expense]);
  
  return (
    <div className="space-y-4">
      {/* Only show tags for variable expenses */}
      {(category === 'variable' || !expense) && (
        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map(tag => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                {tag}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-4 w-4 p-0" 
                  onClick={() => handleRemoveTag(tag)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
          
          {availableTags.length > 0 && (
            <div className="mt-2">
              <Select onValueChange={handleAddTag}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Adicionar tag" />
                </SelectTrigger>
                <SelectContent>
                  {availableTags.map(tag => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}
      
      <ExpenseForm 
        expense={expense ? { ...expense, tags: selectedTags } : undefined} 
        onSave={handleSaveWithTags} 
      />
    </div>
  );
};

export default ExpenseFormWithTags;
