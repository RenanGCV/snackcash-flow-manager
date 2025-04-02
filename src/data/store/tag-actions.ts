
import { defaultExpenseTags } from './defaults';
import { StoreState } from './types';

export const createTagActions = (set: (fn: (state: StoreState) => Partial<StoreState>) => void) => ({
  addExpenseTag: (tag: string) =>
    set((state) => ({
      expenseTags: state.expenseTags.includes(tag) 
        ? state.expenseTags 
        : [...state.expenseTags, tag]
    })),
    
  updateExpenseTag: (oldTag: string, newTag: string) =>
    set((state) => {
      // Don't update if the new tag already exists
      if (state.expenseTags.includes(newTag) && oldTag !== newTag) {
        return { expenseTags: state.expenseTags };
      }
      
      // Update the tag
      return {
        expenseTags: state.expenseTags.map(tag => 
          tag === oldTag ? newTag : tag
        ),
        // Also update tag in existing expenses
        expenses: state.expenses.map(expense => 
          expense.tags?.includes(oldTag) 
            ? { 
                ...expense, 
                tags: expense.tags.map(t => t === oldTag ? newTag : t) 
              } 
            : expense
        )
      };
    }),
    
  removeExpenseTag: (tag: string) =>
    set((state) => {
      // Removed the check for default tags since we no longer want to protect them
      return {
        expenseTags: state.expenseTags.filter(t => t !== tag),
        // Also remove the tag from any expenses that were using it
        expenses: state.expenses.map(expense => 
          expense.tags?.includes(tag)
            ? {
                ...expense,
                tags: expense.tags.filter(t => t !== tag)
              }
            : expense
        )
      };
    }),
});
