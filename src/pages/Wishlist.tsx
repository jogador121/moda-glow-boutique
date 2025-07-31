import { useAuth } from "@/contexts/AuthContext";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

interface WishlistItem {
  id: string;
  product_id: string;
  created_at: string;
  products: {
    id: string;
    name: string;
    price: number;
    compare_price: number | null;
    images: string[];
    slug: string;
    is_active: boolean;
    stock_quantity: number;
  };
}

const Wishlist = () => {
  useAuthGuard();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: wishlistItems = [], isLoading } = useQuery({
    queryKey: ['wishlist', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          id,
          product_id,
          created_at,
          products (
            id,
            name,
            price,
            compare_price,
            images,
            slug,
            is_active,
            stock_quantity
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WishlistItem[];
    },
    enabled: !!user,
  });

  const removeFromWishlist = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', user?.id] });
      toast({
        title: "Produto removido",
        description: "O produto foi removido da sua lista de desejos.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível remover o produto. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const addToCart = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error('Usuário não autenticado');

      // Verificar se já existe no carrinho
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (existingItem) {
        // Atualizar quantidade
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id);

        if (error) throw error;
      } else {
        // Criar novo item
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity: 1,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart-count', user?.id] });
      toast({
        title: "Adicionado ao carrinho",
        description: "O produto foi adicionado ao seu carrinho.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar ao carrinho. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Heart className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-display font-bold text-foreground">
              Lista de Desejos
            </h1>
            <Badge variant="secondary" className="ml-2">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'itens'}
            </Badge>
          </div>

          {wishlistItems.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Sua lista de desejos está vazia
              </h2>
              <p className="text-muted-foreground mb-6">
                Explore nossos produtos e adicione seus favoritos aqui
              </p>
              <Button asChild>
                <Link to="/produtos">
                  Descobrir Produtos
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((item) => (
                <Card key={item.id} className="group hover:shadow-luxury transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="relative">
                      <Link to={`/produto/${item.products.slug}`}>
                        <div className="aspect-square overflow-hidden rounded-t-lg">
                          <img
                            src={item.products.images[0] || '/placeholder.svg'}
                            alt={item.products.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      </Link>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm hover:bg-white text-red-500 hover:text-red-600"
                        onClick={() => removeFromWishlist.mutate(item.product_id)}
                        disabled={removeFromWishlist.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="p-4">
                      <Link to={`/produto/${item.products.slug}`}>
                        <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                          {item.products.name}
                        </h3>
                      </Link>

                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg font-bold text-foreground">
                          {formatPrice(item.products.price)}
                        </span>
                        {item.products.compare_price && item.products.compare_price > item.products.price && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(item.products.compare_price)}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="shrink-0"
                          onClick={() => removeFromWishlist.mutate(item.product_id)}
                          disabled={removeFromWishlist.isPending}
                        >
                          <Heart className="h-4 w-4 fill-current text-red-500" />
                        </Button>
                        
                        <Button
                          className="flex-1"
                          onClick={() => addToCart.mutate(item.product_id)}
                          disabled={
                            addToCart.isPending || 
                            !item.products.is_active || 
                            item.products.stock_quantity === 0
                          }
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          {item.products.stock_quantity === 0 
                            ? 'Esgotado' 
                            : addToCart.isPending 
                              ? 'Adicionando...' 
                              : 'Adicionar'
                          }
                        </Button>
                      </div>

                      {item.products.stock_quantity === 0 && (
                        <Badge variant="destructive" className="w-full justify-center mt-2">
                          Produto Esgotado
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Wishlist;