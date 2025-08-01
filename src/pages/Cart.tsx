import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useCart } from '@/hooks/useCart';

const Cart: React.FC = () => {
  const { user } = useAuth();
  const { 
    items: cartItems, 
    isLoading, 
    totals,
    updateQuantity: updateQuantityMutation,
    removeItem: removeItemMutation,
    isUpdating,
    isRemoving 
  } = useCart();

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantityMutation.mutate({ itemId, quantity: newQuantity });
  };

  const handleRemoveItem = (itemId: string) => {
    removeItemMutation.mutate(itemId);
  };

  if (!user) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-8 text-center">
          <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-4">Acesse sua conta</h2>
          <p className="text-muted-foreground mb-6">
            Faça login para ver os itens do seu carrinho
          </p>
          <Button asChild>
            <Link to="/auth">Fazer Login</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-muted rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-8 text-center">
          <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-4">Seu carrinho está vazio</h2>
          <p className="text-muted-foreground mb-6">
            Adicione produtos ao seu carrinho para continuar
          </p>
          <Button asChild>
            <Link to="/produtos">Continuar Comprando</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Meu Carrinho</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items do Carrinho */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Link to={`/produto/${item.product.slug}`}>
                    <img
                      src={item.product.images?.[0] || '/placeholder.svg'}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded border"
                    />
                  </Link>
                  
                  <div className="flex-1">
                    <Link to={`/produto/${item.product.slug}`}>
                      <h3 className="font-semibold hover:underline">
                        {item.product.name}
                      </h3>
                    </Link>
                    
                    <div className="text-sm text-muted-foreground mt-1 space-y-1">
                      {item.selected_size && (
                        <p>Tamanho: {item.selected_size}</p>
                      )}
                      {item.selected_color && (
                        <p>Cor: {item.selected_color}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || isUpdating}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="px-3 py-1 border rounded text-center min-w-[50px]">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={
                            item.quantity >= item.product.stock_quantity ||
                            isUpdating
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-lg">
                          R$ {(item.product.price * item.quantity).toFixed(2)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={isRemoving}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Resumo do Pedido */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal ({totals.itemCount} {totals.itemCount === 1 ? 'item' : 'itens'})</span>
                <span>R$ {totals.subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Frete</span>
                <span>Calculado no checkout</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>R$ {totals.subtotal.toFixed(2)}</span>
              </div>
              
              <Button className="w-full" size="lg" asChild>
                <Link to="/checkout">Finalizar Compra</Link>
              </Button>
              
              <Button variant="outline" className="w-full" asChild>
                <Link to="/produtos">Continuar Comprando</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
};

export default Cart;