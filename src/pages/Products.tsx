import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category_id: string;
  is_featured: boolean;
  stock_quantity: number;
  slug: string;
  categories?: {
    slug: string;
    name: string;
  };
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const addToCart = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para adicionar produtos ao carrinho",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .upsert({
          user_id: user.id,
          product_id: product.id,
          quantity: 1,
        }, {
          onConflict: 'user_id,product_id',
          ignoreDuplicates: false,
        });

      if (error) throw error;

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
    <Card className="group cursor-pointer transition-transform hover:scale-105">
      <Link to={`/produto/${product.slug}`}>
        <div className="aspect-square overflow-hidden rounded-t-lg">
          <img
            src={product.images?.[0] || '/placeholder.svg'}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-110"
          />
        </div>
      </Link>
      <CardContent className="p-4">
        <Link to={`/produto/${product.slug}`}>
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-primary">
              R$ {product.price.toFixed(2)}
            </span>
            <span className="text-xs text-muted-foreground">
              Estoque: {product.stock_quantity}
            </span>
          </div>
          {product.is_featured && (
            <Badge variant="secondary">Destaque</Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          variant="outline"
          size="icon"
          className="shrink-0"
          onClick={(e) => {
            e.preventDefault();
            // TODO: Adicionar à wishlist
          }}
        >
          <Heart className="h-4 w-4" />
        </Button>
        <Button
          className="flex-1"
          onClick={(e) => {
            e.preventDefault();
            addToCart();
          }}
          disabled={product.stock_quantity === 0}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {product.stock_quantity === 0 ? 'Esgotado' : 'Adicionar'}
        </Button>
      </CardFooter>
    </Card>
  );
};

const Products: React.FC = () => {
  const [searchParams] = useSearchParams();
  const categorySlug = searchParams.get('categoria');

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products', categorySlug],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          categories!inner(slug, name)
        `)
        .eq('is_active', true);

      if (categorySlug) {
        query = query.eq('categories.slug', categorySlug);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data as Product[];
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-square bg-muted rounded-t-lg" />
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-3 bg-muted rounded mb-3" />
                <div className="h-6 bg-muted rounded w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-destructive">Erro ao carregar produtos</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">
          {categorySlug ? `Produtos - ${products?.[0]?.categories?.name || categorySlug}` : 'Nossos Produtos'}
        </h1>
        <p className="text-muted-foreground">
          {categorySlug 
            ? `Explore nossa seleção de produtos na categoria ${products?.[0]?.categories?.name || categorySlug}`
            : 'Descubra nossa coleção exclusiva de moda feminina'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products?.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {products?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum produto encontrado</p>
        </div>
      )}
    </div>
  );
};

export default Products;