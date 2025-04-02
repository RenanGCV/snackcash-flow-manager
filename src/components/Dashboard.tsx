
import { useStore } from '../data/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Sale } from '../data/types';
import { ShoppingBag, DollarSign, Receipt, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { products, sales, expenses } = useStore();
  
  // Calculate total sales today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const salesToday = sales.filter(sale => 
    new Date(sale.date).getTime() >= today.getTime()
  );
  
  const totalSalesToday = salesToday.reduce((sum, sale) => sum + sale.total, 0);
  
  // Calculate total expenses this month
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const expensesThisMonth = expenses.filter(expense => 
    new Date(expense.date).getTime() >= startOfMonth.getTime()
  );
  
  const totalExpensesThisMonth = expensesThisMonth.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Calculate profit
  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const profit = totalSales - totalExpenses;
  
  // Latest transactions
  const recentTransactions = [...sales, ...expenses.map(expense => ({
    id: expense.id,
    type: 'expense' as const,
    description: expense.description,
    amount: expense.amount,
    date: expense.date
  }))].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  ).slice(0, 5);
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Hoje</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalSalesToday.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {salesToday.length} transações
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              itens cadastrados
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas do Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalExpensesThisMonth.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {expensesThisMonth.length} despesas registradas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {profit.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              desde o início
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransactions.length > 0 ? (
            <div className="space-y-2">
              {recentTransactions.map(transaction => {
                const isSale = 'total' in transaction;
                const amount = isSale ? (transaction as Sale).total : transaction.amount;
                const description = isSale ? 'Venda' : transaction.description;
                
                return (
                  <div key={transaction.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{description}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(transaction.date), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <div className={`font-medium ${isSale ? 'text-green-600' : 'text-red-600'}`}>
                      {isSale ? '+' : '-'}R$ {amount.toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-6">
              Nenhuma transação registrada ainda.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
