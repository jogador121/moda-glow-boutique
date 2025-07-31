import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';

const OrderConfirmed: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, orderNumber } = location.state || {};

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Pedido Confirmado!</h1>
          <p className="text-muted-foreground">
            Seu pedido foi processado com sucesso
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <Package className="h-5 w-5" />
              Detalhes do Pedido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {orderNumber && (
              <div>
                <p className="text-sm text-muted-foreground">Número do Pedido</p>
                <p className="font-semibold text-lg">{orderNumber}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="text-yellow-600 font-medium">Processando Pagamento</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Próximo Passo</p>
              <p>Você receberá um email de confirmação em breve</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Button
            onClick={() => navigate('/pedidos')}
            className="w-full"
            size="lg"
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
  );
};

export default OrderConfirmed;