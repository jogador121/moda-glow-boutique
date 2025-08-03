import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Package, ArrowRight, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const OrderConfirmed: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { orderId, orderNumber, awaitingPayment } = location.state || {};
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'failed'>('pending');

  // Query para verificar o status do pedido
  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!orderId || !user) return null;

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!orderId && !!user,
    refetchInterval: paymentStatus === 'pending' ? 5000 : false, // Refetch a cada 5s se pendente
  });

  useEffect(() => {
    if (order && order.payment_status) {
      const status = order.payment_status as 'pending' | 'paid' | 'failed';
      setPaymentStatus(status);
    }
  }, [order]);

  const getStatusDisplay = () => {
    switch (paymentStatus) {
      case 'paid':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          title: 'Pedido Confirmado!',
          subtitle: 'Pagamento processado com sucesso',
          status: 'Confirmado',
          statusColor: 'text-green-600'
        };
      case 'failed':
        return {
          icon: AlertCircle,
          color: 'text-red-500',
          title: 'Problema no Pagamento',
          subtitle: 'Houve um problema ao processar seu pagamento',
          status: 'Pagamento Falhado',
          statusColor: 'text-red-600'
        };
      default:
        return {
          icon: Clock,
          color: 'text-yellow-500',
          title: 'Processando Pagamento...',
          subtitle: 'Aguardando confirmação do pagamento',
          status: 'Processando',
          statusColor: 'text-yellow-600'
        };
    }
  };

  const statusDisplay = getStatusDisplay();
  const StatusIcon = statusDisplay.icon;

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-20 w-20 bg-muted rounded-full mx-auto" />
              <div className="h-8 bg-muted rounded w-64 mx-auto" />
              <div className="h-48 bg-muted rounded" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <StatusIcon className={`h-20 w-20 ${statusDisplay.color} mx-auto mb-4`} />
            <h1 className="text-3xl font-bold mb-2">{statusDisplay.title}</h1>
            <p className="text-muted-foreground">
              {statusDisplay.subtitle}
            </p>
            {paymentStatus === 'pending' && (
              <p className="text-sm text-muted-foreground mt-2">
                Esta página será atualizada automaticamente quando o pagamento for confirmado
              </p>
            )}
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <Package className="h-5 w-5" />
                Detalhes do Pedido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order?.order_number && (
                <div>
                  <p className="text-sm text-muted-foreground">Número do Pedido</p>
                  <p className="font-semibold text-lg">{order.order_number}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className={`font-medium ${statusDisplay.statusColor}`}>
                  {statusDisplay.status}
                </p>
              </div>
              {order?.total_amount && (
                <div>
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                  <p className="font-semibold">R$ {order.total_amount.toFixed(2)}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Próximo Passo</p>
                <p>
                  {paymentStatus === 'paid' 
                    ? 'Você receberá um email de confirmação em breve'
                    : paymentStatus === 'failed'
                    ? 'Tente novamente ou entre em contato conosco'
                    : 'Aguardando confirmação do pagamento'
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {paymentStatus === 'failed' && (
              <Button
                onClick={() => navigate('/carrinho')}
                className="w-full"
                size="lg"
              >
                Tentar Novamente
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
            
            <Button
              onClick={() => navigate('/pedidos')}
              className="w-full"
              size="lg"
              variant={paymentStatus === 'failed' ? 'outline' : 'default'}
            >
              Ver Meus Pedidos
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate('/produtos')}
              className="w-full"
            >
              Continuar Comprando
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderConfirmed;