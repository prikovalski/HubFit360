
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, DollarSign, Package, TrendingUp, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  paid_at: string;
  created_at: string;
  products: {
    name: string;
    type: string;
    price: number;
  };
  users: {
    name: string;
    email: string;
  };
}

const PaymentsReport = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [products, setProducts] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchPayments();
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  };

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          products (name, type, price),
          users (name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Erro ao buscar pagamentos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar relatório de pagamentos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const productMatch = selectedProduct === 'all' || payment.products?.type === selectedProduct;
    const statusMatch = selectedStatus === 'all' || payment.status === selectedStatus;
    return productMatch && statusMatch;
  });

  const stats = {
    totalRevenue: filteredPayments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + Number(p.amount), 0),
    totalSales: filteredPayments.filter(p => p.status === 'paid').length,
    pendingPayments: filteredPayments.filter(p => p.status === 'pending').length,
    conversionRate: filteredPayments.length > 0 
      ? (filteredPayments.filter(p => p.status === 'paid').length / filteredPayments.length * 100)
      : 0
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    };
    
    const labels = {
      paid: 'Pago',
      pending: 'Pendente',
      failed: 'Falhou',
      refunded: 'Reembolsado'
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const exportToCSV = () => {
    const csvData = filteredPayments.map(payment => ({
      'Data': format(new Date(payment.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
      'Produto': payment.products?.name || 'N/A',
      'Cliente': payment.users?.name || 'N/A',
      'Email': payment.users?.email || 'N/A',
      'Valor': `R$ ${Number(payment.amount).toFixed(2).replace('.', ',')}`,
      'Status': payment.status,
      'Método': payment.payment_method || 'N/A',
      'Data Pagamento': payment.paid_at ? format(new Date(payment.paid_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : 'N/A'
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-pagamentos-${format(new Date(), 'dd-MM-yyyy')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#019f80]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Relatório de Pagamentos</h1>
          <p className="text-gray-600">Análise completa de vendas por produto</p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex space-x-4">
        <Select value={selectedProduct} onValueChange={setSelectedProduct}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por produto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os produtos</SelectItem>
            {products.map(product => (
              <SelectItem key={product.id} value={product.type}>
                {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="paid">Pagos</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="failed">Falharam</SelectItem>
            <SelectItem value="refunded">Reembolsados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {stats.totalRevenue.toFixed(2).replace('.', ',')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Realizadas</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalSales}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagamentos Pendentes</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingPayments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.conversionRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Pagamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Data</th>
                  <th className="text-left p-4">Produto</th>
                  <th className="text-left p-4">Cliente</th>
                  <th className="text-left p-4">Valor</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Método</th>
                  <th className="text-left p-4">Pago em</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      {format(new Date(payment.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{payment.products?.name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{payment.products?.type}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{payment.users?.name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{payment.users?.email}</div>
                      </div>
                    </td>
                    <td className="p-4 font-medium">
                      R$ {Number(payment.amount).toFixed(2).replace('.', ',')}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="p-4">{payment.payment_method || 'N/A'}</td>
                    <td className="p-4">
                      {payment.paid_at 
                        ? format(new Date(payment.paid_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })
                        : 'N/A'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredPayments.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum pagamento encontrado com os filtros selecionados.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentsReport;
