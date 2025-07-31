import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Download, Calendar, TrendingUp, Package, Users, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

interface ReportData {
  salesByPeriod: any[];
  topProducts: any[];
  categoryPerformance: any[];
  revenueMetrics: {
    totalRevenue: number;
    monthlyRevenue: number;
    averageOrderValue: number;
    totalOrders: number;
  };
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

export default function AdminReports() {
  const [reportData, setReportData] = useState<ReportData>({
    salesByPeriod: [],
    topProducts: [],
    categoryPerformance: [],
    revenueMetrics: {
      totalRevenue: 0,
      monthlyRevenue: 0,
      averageOrderValue: 0,
      totalOrders: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30days');

  useEffect(() => {
    fetchReportData();
  }, [period]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Calcular data de início baseado no período selecionado
      const now = new Date();
      const startDate = new Date();
      
      switch (period) {
        case '7days':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30days':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90days':
          startDate.setDate(now.getDate() - 90);
          break;
        case '365days':
          startDate.setDate(now.getDate() - 365);
          break;
        default:
          startDate.setDate(now.getDate() - 30);
      }

      // Buscar dados de vendas
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*)
        `)
        .gte('created_at', startDate.toISOString())
        .eq('payment_status', 'paid');

      if (ordersError) throw ordersError;

      // Calcular métricas de receita
      const totalRevenue = ordersData?.reduce((sum, order) => 
        sum + parseFloat(order.total_amount), 0) || 0;
      
      const monthlyRevenue = ordersData?.filter(order => {
        const orderDate = new Date(order.created_at);
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return orderDate >= monthAgo;
      }).reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0;

      const averageOrderValue = ordersData?.length ? totalRevenue / ordersData.length : 0;

      // Vendas por período
      const salesByDay = [];
      const periodDays = parseInt(period.replace('days', ''));
      
      for (let i = periodDays - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayOrders = ordersData?.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate.toISOString().split('T')[0] === dateStr;
        }) || [];
        
        const dayRevenue = dayOrders.reduce((sum, order) => 
          sum + parseFloat(order.total_amount), 0);
        
        salesByDay.push({
          date: date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
          revenue: dayRevenue,
          orders: dayOrders.length
        });
      }

      // Produtos mais vendidos
      const productSales: { [key: string]: { name: string; quantity: number; revenue: number; category: string } } = {};
      
      ordersData?.forEach(order => {
        order.order_items?.forEach(item => {
          if (!productSales[item.product_name]) {
            productSales[item.product_name] = {
              name: item.product_name,
              quantity: 0,
              revenue: 0,
              category: 'Produto'
            };
          }
          productSales[item.product_name].quantity += item.quantity;
          productSales[item.product_name].revenue += parseFloat(item.total_price);
        });
      });

      const topProducts = Object.values(productSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10);

      // Buscar performance por categoria
      const { data: categoriesData } = await supabase
        .from('categories')
        .select(`
          id,
          name,
          products(
            id,
            order_items(quantity, total_price)
          )
        `);

      const categoryPerformance = categoriesData?.map(category => {
        let totalQuantity = 0;
        let totalRevenue = 0;

        category.products?.forEach((product: any) => {
          product.order_items?.forEach((item: any) => {
            totalQuantity += item.quantity;
            totalRevenue += parseFloat(item.total_price);
          });
        });

        return {
          name: category.name,
          quantity: totalQuantity,
          revenue: totalRevenue
        };
      }).filter(cat => cat.quantity > 0)
        .sort((a, b) => b.revenue - a.revenue) || [];

      setReportData({
        salesByPeriod: salesByDay,
        topProducts,
        categoryPerformance,
        revenueMetrics: {
          totalRevenue,
          monthlyRevenue,
          averageOrderValue,
          totalOrders: ordersData?.length || 0
        }
      });

    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    // Simular export - em um app real, você geraria um CSV ou PDF
    const csvData = [
      ['Data', 'Receita', 'Pedidos'],
      ...reportData.salesByPeriod.map(item => [
        item.date,
        item.revenue.toString(),
        item.orders.toString()
      ])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-vendas-${period}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Relatório exportado com sucesso');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-16 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Relatórios</h1>
        <div className="flex items-center gap-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Últimos 7 dias</SelectItem>
              <SelectItem value="30days">Últimos 30 dias</SelectItem>
              <SelectItem value="90days">Últimos 90 dias</SelectItem>
              <SelectItem value="365days">Último ano</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={exportReport} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(reportData.revenueMetrics.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Últimos {period.replace('days', ' dias')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(reportData.revenueMetrics.monthlyRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(reportData.revenueMetrics.averageOrderValue)}
            </div>
            <p className="text-xs text-muted-foreground">Por pedido</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.revenueMetrics.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Últimos {period.replace('days', ' dias')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Gráfico de Vendas */}
        <Card>
          <CardHeader>
            <CardTitle>Vendas por Período</CardTitle>
            <CardDescription>Receita diária nos últimos {period.replace('days', ' dias')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportData.salesByPeriod}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' 
                      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value))
                      : value,
                    name === 'revenue' ? 'Receita' : 'Pedidos'
                  ]}
                />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle>Performance por Categoria</CardTitle>
            <CardDescription>Receita por categoria de produto</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reportData.categoryPerformance.slice(0, 5)}
                  dataKey="revenue"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {reportData.categoryPerformance.slice(0, 5).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => 
                  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value))
                } />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Produtos Mais Vendidos */}
      <Card>
        <CardHeader>
          <CardTitle>Produtos Mais Vendidos</CardTitle>
          <CardDescription>Top 10 produtos por quantidade vendida</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Receita</TableHead>
                  <TableHead>Ticket Médio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.topProducts.map((product, index) => (
                  <TableRow key={product.name}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">#{index + 1}</Badge>
                        {product.name}
                      </div>
                    </TableCell>
                    <TableCell>{product.quantity} unidades</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(product.revenue)}
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(product.revenue / product.quantity)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {reportData.topProducts.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              Nenhuma venda encontrada no período selecionado.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}