
import { useState, useEffect } from 'react';
import { useStore } from '../../data/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Edit, Trash, Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const TagManager = () => {
  const { expenseTags, addExpenseTag, updateExpenseTag, removeExpenseTag } = useStore();
  const [newTag, setNewTag] = useState('');
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  
  const handleAddTag = () => {
    if (newTag.trim() === '') {
      toast.error('O nome da tag não pode estar vazio');
      return;
    }
    
    if (expenseTags.includes(newTag.toLowerCase())) {
      toast.error('Esta tag já existe');
      return;
    }
    
    addExpenseTag(newTag.toLowerCase());
    setNewTag('');
    toast.success('Tag adicionada com sucesso!');
  };
  
  const handleUpdateTag = () => {
    if (editValue.trim() === '') {
      toast.error('O nome da tag não pode estar vazio');
      return;
    }
    
    if (editingTag) {
      updateExpenseTag(editingTag, editValue.toLowerCase());
      setEditingTag(null);
      setEditValue('');
      toast.success('Tag atualizada com sucesso!');
    }
  };
  
  const handleDeleteTag = (tag: string) => {
    removeExpenseTag(tag);
    toast.success('Tag removida com sucesso!');
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Gerenciar Tags de Despesas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Nova tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAddTag}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {expenseTags.map((tag) => (
              <div key={tag} className="flex items-center">
                {editingTag === tag ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-32 h-8"
                      autoFocus
                    />
                    <Button size="sm" variant="ghost" onClick={handleUpdateTag}>
                      Salvar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => {
                        setEditingTag(null);
                        setEditValue('');
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Badge variant="secondary" className="px-3 py-1 h-8">
                    <span className="mr-2">{tag}</span>
                    <div className="flex items-center space-x-1">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-5 w-5"
                        onClick={() => {
                          setEditingTag(tag);
                          setEditValue(tag);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-5 w-5">
                            <Trash className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover tag</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja remover a tag "{tag}"? Esta ação também removerá esta tag de todas as despesas que a utilizam.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteTag(tag)}>
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TagManager;
