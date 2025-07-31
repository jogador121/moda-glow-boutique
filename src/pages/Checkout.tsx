import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, CreditCard, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  quantity: number;
  selected_size?: string;
  selected_color?: string;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
  };
}

interface Address {
  recipient_name: string;
  street_address: string;
  street_number: string;
  neighborhood: string;
  city: string;
  state: string;
  postal_code: string;
  complement?: string;
}

const Checkout: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [shippingAddress, setShippingAddress] = useState<Address>({
    recipient_name: '',
    street_address: '',
    street_number: '',
    neighborhood: '',
    city: '',
    state: '',
    postal_code: '',
    complement: '',
  });

  const [billingAddress, setBillingAddress] = useState<Address>({
    recipient_name: '',
    street_address: '',
    street_number: '',
    neighborhood: '',
    city: '',
    state: '',
    postal_code: '',
    complement: '',
  });

  const [useSameAddress, setUseSameAddress] = useState(true);
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: cartItems, isLoading: loadingCart } = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          quantity,
          selected_size,
          selected_color,
          product:products (
            id,
            name,
            price,
            images
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      return data as CartItem[];
    },
    enabled: !!user,
  });

  const subtotal = cartItems?.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) || 0;
  const shippingCost = subtotal > 200 ? 0 : 15.90;
  const total = subtotal + shippingCost;

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      if (!user || !cartItems || cartItems.length === 0) {
        throw new Error('Carrinho vazio ou usuário não autenticado');
      }

      // Criar pedido - order_number será gerado automaticamente via trigger
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          order_number: '', // Será preenchido automaticamente pelo trigger
          subtotal,
          shipping_cost: shippingCost,
          total_amount: total,
          shipping_address: shippingAddress as any,
          billing_address: (useSameAddress ? shippingAddress : billingAddress) as any,
          notes: notes || null,
          status: 'pending',
          payment_status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Criar itens do pedido
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_image: item.product.images?.[0] || null,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.product.price * item.quantity,
        selected_size: item.selected_size || null,
        selected_color: item.selected_color || null,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Processar pagamento via Stripe
      const { data: paymentData, error: paymentError } = await supabase.functions
        .invoke('create-payment', {
          body: {
            order_id: order.id,
            amount: Math.round(total * 100), // Converter para centavos
            items: cartItems.map(item => ({
              name: item.product.name,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        });

      if (paymentError) throw paymentError;

      // Limpar carrinho após criar pedido
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      return { order, paymentUrl: paymentData.url };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
      
      // Redirecionar para Stripe Checkout
      if (data.paymentUrl) {
        window.open(data.paymentUrl, '_blank');
        navigate('/pedido-confirmado', { 
          state: { orderId: data.order.id, orderNumber: data.order.order_number } 
        });
      }
    },
    onError: (error) => {
      console.error('Erro ao processar pedido:', error);
      toast({
        title: "Erro no pagamento",
        description: "Não foi possível processar seu pedido. Tente novamente.",
        variant: "destructive",
      });
      setIsProcessing(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para finalizar a compra",
        variant: "destructive",
      });
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione produtos ao carrinho antes de finalizar a compra",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    createOrderMutation.mutate();
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Acesso restrito</h2>
        <p className="text-muted-foreground mb-6">
          Faça login para finalizar sua compra
        </p>
        <Button onClick={() => navigate('/auth')}>Fazer Login</Button>
      </div>
    );
  }

  if (loadingCart) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-64" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="h-96 bg-muted rounded" />
            </div>
            <div className="space-y-4">
              <div className="h-48 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Carrinho vazio</h2>
        <p className="text-muted-foreground mb-6">
          Adicione produtos ao carrinho antes de finalizar a compra
        </p>
        <Button onClick={() => navigate('/produtos')}>Ver Produtos</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate('/carrinho')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar ao Carrinho
      </Button>

      <h1 className="text-3xl font-bold mb-8">Finalizar Compra</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulário de Endereço */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Endereço de Entrega</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="recipient_name">Nome do Destinatário</Label>
                  <Input
                    id="recipient_name"
                    value={shippingAddress.recipient_name}
                    onChange={(e) => setShippingAddress(prev => ({
                      ...prev,
                      recipient_name: e.target.value
                    }))}
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="street_address">Endereço</Label>
                    <Input
                      id="street_address"
                      value={shippingAddress.street_address}
                      onChange={(e) => setShippingAddress(prev => ({
                        ...prev,
                        street_address: e.target.value
                      }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="street_number">Número</Label>
                    <Input
                      id="street_number"
                      value={shippingAddress.street_number}
                      onChange={(e) => setShippingAddress(prev => ({
                        ...prev,
                        street_number: e.target.value
                      }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    value={shippingAddress.complement}
                    onChange={(e) => setShippingAddress(prev => ({
                      ...prev,
                      complement: e.target.value
                    }))}
                  />
                </div>

                <div>
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    value={shippingAddress.neighborhood}
                    onChange={(e) => setShippingAddress(prev => ({
                      ...prev,
                      neighborhood: e.target.value
                    }))}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress(prev => ({
                        ...prev,
                        city: e.target.value
                      }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">Estado</Label>
                    <Input
                      id="state"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress(prev => ({
                        ...prev,
                        state: e.target.value
                      }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="postal_code">CEP</Label>
                  <Input
                    id="postal_code"
                    value={shippingAddress.postal_code}
                    onChange={(e) => setShippingAddress(prev => ({
                      ...prev,
                      postal_code: e.target.value
                    }))}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Instruções especiais para entrega..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </CardContent>
            </Card>
          </div>

          {/* Resumo do Pedido */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Qtd: {item.quantity}
                        {item.selected_size && ` • Tamanho: ${item.selected_size}`}
                        {item.selected_color && ` • Cor: ${item.selected_color}`}
                      </p>
                    </div>
                    <span className="font-medium">
                      R$ {(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>R$ {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Frete</span>
                    <span>
                      {shippingCost === 0 ? 'Grátis' : `R$ ${shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>R$ {total.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isProcessing}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {isProcessing ? 'Processando...' : 'Finalizar Compra'}
                </Button>

                <div className="flex items-center justify-center text-sm text-muted-foreground">
                  <Lock className="h-4 w-4 mr-1" />
                  Pagamento seguro via Stripe
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;