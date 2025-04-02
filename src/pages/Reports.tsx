
import { useState, useMemo } from 'react';
import Layout from '../components/Layout';
import { useStore } from '../data/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, LineChart, Line, Pie, PieChart, Cell } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartBar, ChartPie, TrendingUp, TrendingDown, Tag, FileText, Calendar } from 'lucide-react';

const Reports = () => {
  const { sales, expenses, products } = useStore();
  const [selectedMonth, setSelectedMonth] = useState(0); // 0 = current month, 1 = last month, etc.

  // Get data for the selected month
  const selectedDate = useMemo(() => {
    return subMonths(new Date(), selectedMonth);
  }, [selectedMonth]);

  // Get period range
  const periodStart = useMemo(() => startOfMonth(selectedDate), [selectedDate]);
  const periodEnd = useMemo(() => endOfMonth(selectedDate), [selectedDate]);

  // Format month title
  const monthTitle = useMemo(() => {
    return format(selectedDate, 'MMMM yyyy', { locale: ptBR });
  }, [selectedDate]);

  // Filter sales and expenses for the selected month
  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return isWithinInterval(saleDate, { start: periodStart, end: periodEnd });
    });
  }, [sales, periodStart, periodEnd]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return isWithinInterval(expenseDate, { start: periodStart, end: periodEnd });
    });
  }, [expenses, periodStart, periodEnd]);

  // Calculate monthly totals
  const totalSales = useMemo(() => {
    return filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  }, [filteredSales]);

  const totalExpenses = useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [filteredExpenses]);

  const monthlyProfit = totalSales - totalExpenses;
  const profitPercentage = totalSales > 0 
    ? ((monthlyProfit / totalSales) * 100).toFixed(1) 
    : '0';

  // Calculate top selling products
  const productSalesData = useMemo(() => {
    const productMap = new Map();

    // Initialize all products with zero sales
    products.forEach(product => {
      productMap.set(product.id, { id: product.id, name: product.name, quantity: 0, total: 0 });
    });

    // Count sales
    filteredSales.forEach(sale => {
      sale.products.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const productData = productMap.get(product.id);
          productMap.set(product.id, {
            ...productData,
            quantity: productData.quantity + item.quantity,
            total: productData.total + (item.quantity * product.price)
          });
        }
      });
    });

    return Array.from(productMap.values())
      .filter(item => item.quantity > 0)
      .sort((a, b) => b.quantity - a.quantity);
  }, [filteredSales, products]);

  // Group expenses by tag
  const expensesByTag = useMemo(() => {
    const tagMap = new Map();
    
    // Group expenses by tag
    filteredExpenses.forEach(expense => {
      if (expense.tags && expense.tags.length > 0) {
        expense.tags.forEach(tag => {
          const currentAmount = tagMap.get(tag) || 0;
          tagMap.set(tag, currentAmount + expense.amount);
        });
      } else {
        // For expenses without tags
        const currentAmount = tagMap.get('sem tag') || 0;
        tagMap.set('sem tag', currentAmount + expense.amount);
      }
    });
    
    return Array.from(tagMap.entries())
      .map(([tag, amount]) => ({ tag, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredExpenses]);

  // Top expense categories
  const topExpenseTags = useMemo(() => {
    return expensesByTag.slice(0, 5);
  }, [expensesByTag]);

  // Daily sales data for charts
  const dailySalesData = useMemo(() => {
    const daysInMonth = new Array(31).fill(0).map((_, i) => i + 1);
    const dailyMap = new Map();
    
    daysInMonth.forEach(day => {
      if (day <= periodEnd.getDate()) {
        dailyMap.set(day, 0);
      }
    });
    
    filteredSales.forEach(sale => {
      const day = new Date(sale.date).getDate();
      dailyMap.set(day, (dailyMap.get(day) || 0) + sale.total);
    });
    
    return Array.from(dailyMap.entries())
      .map(([day, value]) => ({ day, value }));
  }, [filteredSales, periodEnd]);

  // Monthly comparison data
  const monthlyComparison = useMemo(() => {
    // Get data for previous month
    const previousMonthStart = startOfMonth(addMonths(periodStart, -1));
    const previousMonthEnd = endOfMonth(addMonths(periodStart, -1));
    
    const previousMonthSales = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return isWithinInterval(saleDate, { start: previousMonthStart, end: previousMonthEnd });
    });
    
    const previousMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return isWithinInterval(expenseDate, { start: previousMonthStart, end: previousMonthEnd });
    });
    
    const prevTotalSales = previousMonthSales.reduce((sum, sale) => sum + sale.total, 0);
    const prevTotalExpenses = previousMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const prevProfit = prevTotalSales - prevTotalExpenses;
    
    // Calculate growth percentages
    const salesGrowth = prevTotalSales > 0 
      ? ((totalSales - prevTotalSales) / prevTotalSales * 100).toFixed(1) 
      : totalSales > 0 ? '100' : '0';
    
    const expensesGrowth = prevTotalExpenses > 0 
      ? ((totalExpenses - prevTotalExpenses) / prevTotalExpenses * 100).toFixed(1) 
      : totalExpenses > 0 ? '100' : '0';
    
    const profitGrowth = prevProfit > 0 
      ? ((monthlyProfit - prevProfit) / prevProfit * 100).toFixed(1) 
      : monthlyProfit > 0 ? '100' : '0';
    
    return {
      salesGrowth: Number(salesGrowth),
      expensesGrowth: Number(expensesGrowth),
      profitGrowth: Number(profitGrowth),
    };
  }, [sales, expenses, periodStart, totalSales, totalExpenses, monthlyProfit]);

  // Generate months for select dropdown
  const monthOptions = useMemo(() => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      const date = subMonths(new Date(), i);
      months.push({
        value: i.toString(),
        label: format(date, 'MMMM yyyy', { locale: ptBR })
      });
    }
    return months;
  }, []);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
            <p className="text-muted-foreground">
              Visualize relatórios mensais de vendas, despesas e lucros.
            </p>
          </div>

          <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione o mês" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl capitalize flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Resumo do mês: {monthTitle}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="text-muted-foreground text-sm flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    Total de Vendas 
                    {monthlyComparison.salesGrowth !== 0 && (
                      <Badge variant={monthlyComparison.salesGrowth > 0 ? "success" : "destructive"} className="ml-2">
                        {monthlyComparison.salesGrowth > 0 ? '+' : ''}{monthlyComparison.salesGrowth}%
                      </Badge>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-green-600">R$ {totalSales.toFixed(2)}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-muted-foreground text-sm flex items-center gap-1">
                    <TrendingDown className="h-4 w-4" />
                    Total de Despesas
                    {monthlyComparison.expensesGrowth !== 0 && (
                      <Badge variant={monthlyComparison.expensesGrowth < 0 ? "success" : "destructive"} className="ml-2">
                        {monthlyComparison.expensesGrowth > 0 ? '+' : ''}{monthlyComparison.expensesGrowth}%
                      </Badge>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-red-600">R$ {totalExpenses.toFixed(2)}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-muted-foreground text-sm flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    Lucro Mensal
                    {monthlyComparison.profitGrowth !== 0 && (
                      <Badge variant={monthlyComparison.profitGrowth > 0 ? "success" : "destructive"} className="ml-2">
                        {monthlyComparison.profitGrowth > 0 ? '+' : ''}{monthlyComparison.profitGrowth}%
                      </Badge>
                    )}
                  </div>
                  <div className={`text-2xl font-bold flex items-baseline gap-2 ${monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    R$ {monthlyProfit.toFixed(2)}
                    <span className="text-sm font-normal">({profitPercentage}% das vendas)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="overview">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="overview" className="flex items-center gap-1">
                <ChartBar className="h-4 w-4" />
                Visão Geral
              </TabsTrigger>
              <TabsTrigger value="products" className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                Produtos
              </TabsTrigger>
              <TabsTrigger value="expenses" className="flex items-center gap-1">
                <Tag className="h-4 w-4" />
                Despesas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ChartBar className="h-5 w-5" />
                    Vendas Diárias
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ChartContainer config={{
                      sales: { label: 'Vendas', color: '#8884d8' }
                    }}>
                      <LineChart data={dailySalesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="value" stroke="#8884d8" name="sales" />
                      </LineChart>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Produtos Mais Vendidos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ChartContainer config={{
                        value: { label: 'Quantidade', color: '#82ca9d' }
                      }}>
                        <BarChart data={productSalesData.slice(0, 5)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="quantity" fill="#82ca9d" name="value" />
                        </BarChart>
                      </ChartContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ChartPie className="h-5 w-5" />
                      Despesas por Tag
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      {expensesByTag.length > 0 ? (
                        <ChartContainer config={{}}>
                          <PieChart>
                            <Pie
                              data={expensesByTag}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="amount"
                              nameKey="tag"
                            >
                              {expensesByTag.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent nameKey="tag" labelKey="amount" />} />
                          </PieChart>
                        </ChartContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <p className="text-muted-foreground">Nenhuma despesa registrada neste mês</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="products">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Produtos Vendidos
                  </CardTitle>
                  <CardDescription>
                    Detalhamento dos produtos vendidos neste mês, ordenados por quantidade.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {productSalesData.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produto</TableHead>
                          <TableHead className="text-right">Quantidade</TableHead>
                          <TableHead className="text-right">Valor Total</TableHead>
                          <TableHead className="text-right">% do Faturamento</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {productSalesData.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell className="text-right">{product.quantity}</TableCell>
                            <TableCell className="text-right">R$ {product.total.toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                              {totalSales > 0 ? ((product.total / totalSales) * 100).toFixed(1) : 0}%
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">Nenhum produto vendido neste mês</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="expenses" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Despesas por Categoria
                  </CardTitle>
                  <CardDescription>
                    Análise das despesas agrupadas por tags neste mês
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {topExpenseTags.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="h-64">
                        <ChartContainer config={{}}>
                          <PieChart>
                            <Pie
                              data={topExpenseTags}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="amount"
                              nameKey="tag"
                            >
                              {topExpenseTags.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent nameKey="tag" labelKey="amount" />} />
                          </PieChart>
                        </ChartContainer>
                      </div>
                      <div>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Tag</TableHead>
                              <TableHead className="text-right">Valor</TableHead>
                              <TableHead className="text-right">% do Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {topExpenseTags.map((tag) => (
                              <TableRow key={tag.tag}>
                                <TableCell className="font-medium">
                                  <Badge variant="outline">{tag.tag}</Badge>
                                </TableCell>
                                <TableCell className="text-right">R$ {tag.amount.toFixed(2)}</TableCell>
                                <TableCell className="text-right">
                                  {totalExpenses > 0 ? ((tag.amount / totalExpenses) * 100).toFixed(1) : 0}%
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">Nenhuma despesa registrada neste mês</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Detalhamento das Despesas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredExpenses.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Descrição</TableHead>
                          <TableHead>Categoria</TableHead>
                          <TableHead>Tags</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                          <TableHead className="text-right">% do Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredExpenses.map((expense) => (
                          <TableRow key={expense.id}>
                            <TableCell className="font-medium">{expense.description}</TableCell>
                            <TableCell>
                              <Badge variant={expense.category === 'fixed' ? 'secondary' : 'outline'}>
                                {expense.category === 'fixed' ? 'Fixa' : 'Variável'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {expense.tags?.map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {(!expense.tags || expense.tags.length === 0) && (
                                  <span className="text-muted-foreground text-xs">Sem tags</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">R$ {expense.amount.toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                              {totalExpenses > 0 ? ((expense.amount / totalExpenses) * 100).toFixed(1) : 0}%
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">Nenhuma despesa registrada neste mês</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
