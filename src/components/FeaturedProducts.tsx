import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  price: number;
  compare_price?: number;
  images: string[];
  slug: string;
  is_featured: boolean;
}

const FeaturedProducts = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: products, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, compare_price, images, slug, is_featured')
        .eq('is_featured', true)
        .eq('is_active', true)
        .limit(4);

      if (error) throw error;
      return data as Product[];
    },
  });

  const addToCart = async (product: Product) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para adicionar produtos ao carrinho",
        variant: "destructive",
      });
      return;
    }

    try {
      // Verificar se o item já existe no carrinho
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .single();

      if (existingItem) {
        // Se existe, atualizar quantidade
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id);

        if (error) throw error;
      } else {
        // Se não existe, criar novo
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: product.id,
            quantity: 1,
          });

        if (error) throw error;
      }

      toast({
        title: "Produto adicionado",
        description: `${product.name} foi adicionado ao carrinho`,
      });
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o produto ao carrinho",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-semibold text-luxury mb-4">
            Produtos em Destaque
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Peças cuidadosamente selecionadas que estão conquistando o coração das nossas clientes
          </p>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl overflow-hidden shadow-soft animate-pulse">
                <div className="aspect-[3/4] bg-muted" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded w-20" />
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-6 bg-muted rounded w-24" />
                  <div className="h-10 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products?.map((product) => (
              <div
                key={product.id}
                className="group relative bg-card rounded-xl overflow-hidden shadow-soft hover:shadow-luxury transition-all duration-500 hover-lift"
              >
                {/* Badge */}
                {product.is_featured && (
                  <div className="absolute top-3 left-3 z-10 px-2 py-1 rounded-md text-xs font-medium bg-luxury text-luxury-foreground">
                    Destaque
                  </div>
                )}

                {/* Wishlist Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-3 z-10 bg-white/80 backdrop-blur-sm hover:bg-white opacity-0 group-hover:opacity-100 transition-all duration-300"
                  onClick={() => {
                    toast({
                      title: "Em breve",
                      description: "Funcionalidade de favoritos em desenvolvimento",
                    });
                  }}
                >
                  <Heart className="h-4 w-4" />
                </Button>

                {/* Product Image */}
                <Link to={`/produto/${product.slug}`}>
                  <div className="aspect-[3/4] overflow-hidden">
                    <img
                      src={product.images?.[0] || '/placeholder.svg'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                </Link>

                {/* Product Info */}
                <div className="p-4">
                  {/* Product Name */}
                  <Link to={`/produto/${product.slug}`}>
                    <h3 className="font-medium text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg font-semibold text-luxury">
                      R$ {product.price.toFixed(2)}
                    </span>
                    {product.compare_price && product.compare_price > product.price && (
                      <span className="text-sm text-muted-foreground line-through">
                        R$ {product.compare_price.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Add to Cart Button */}
                  <Button
                    className="w-full group opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                    variant="default"
                    onClick={() => addToCart(product)}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Adicionar ao Carrinho
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View More Button */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="hover-lift" asChild>
            <Link to="/produtos">Ver Mais Produtos</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;