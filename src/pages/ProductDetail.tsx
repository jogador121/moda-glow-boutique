import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Heart, ShoppingCart, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import ProductReviews from '@/components/ProductReviews';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compare_price?: number;
  images: string[];
  sizes: string[];
  colors: string[];
  materials: string[];
  care_instructions?: string;
  stock_quantity: number;
  is_featured: boolean;
  category_id: string;
}

const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedSize, setSelectedSize] = React.useState<string>('');
  const [selectedColor, setSelectedColor] = React.useState<string>('');
  const [quantity, setQuantity] = React.useState(1);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data as Product;
    },
    enabled: !!slug,
  });

  const addToCart = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para adicionar produtos ao carrinho",
        variant: "destructive",
      });
      return;
    }

    if (!product) return;

    try {
      // Verificar se o item já existe no carrinho com as mesmas especificações
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .eq('selected_size', selectedSize || null)
        .eq('selected_color', selectedColor || null)
        .single();

      if (existingItem) {
        // Se existe, atualizar quantidade
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id);

        if (error) throw error;
      } else {
        // Se não existe, criar novo
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: product.id,
            quantity,
            selected_size: selectedSize || null,
            selected_color: selectedColor || null,
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

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-muted rounded-lg" />
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded" />
                <div className="h-4 bg-muted rounded w-24" />
                <div className="h-20 bg-muted rounded" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-destructive mb-4">Produto não encontrado</p>
          <Button onClick={() => navigate('/produtos')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos produtos
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : ['/placeholder.svg'];

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Galeria de Imagens */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg border">
            <img
              src={images[currentImageIndex]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`aspect-square overflow-hidden rounded border-2 ${
                    currentImageIndex === index ? 'border-primary' : 'border-border'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Informações do Produto */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-primary">
                  R$ {product.price.toFixed(2)}
                </span>
                {product.compare_price && product.compare_price > product.price && (
                  <span className="text-lg text-muted-foreground line-through">
                    R$ {product.compare_price.toFixed(2)}
                  </span>
                )}
              </div>
              {product.is_featured && (
                <Badge variant="secondary">Destaque</Badge>
              )}
            </div>
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          <Separator />

          {/* Tamanhos */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Tamanho</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Cores */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Cor</h3>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <Button
                    key={color}
                    variant={selectedColor === color ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedColor(color)}
                  >
                    {color}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Quantidade */}
          <div>
            <h3 className="font-semibold mb-3">Quantidade</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </Button>
              <span className="px-4 py-2 border rounded text-center min-w-[60px]">
                {quantity}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                disabled={quantity >= product.stock_quantity}
              >
                +
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {product.stock_quantity} unidades disponíveis
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={async () => {
                if (!user) {
                  toast({
                    title: "Login necessário",
                    description: "Faça login para adicionar produtos aos favoritos.",
                    variant: "destructive",
                  });
                  return;
                }

                try {
                  const { error } = await supabase
                    .from('wishlists')
                    .insert({
                      user_id: user.id,
                      product_id: product.id,
                    });

                  if (error) throw error;

                  toast({
                    title: "Adicionado aos favoritos",
                    description: "Produto adicionado à sua lista de desejos!",
                  });
                } catch (error) {
                  toast({
                    title: "Erro",
                    description: "Não foi possível adicionar aos favoritos.",
                    variant: "destructive",
                  });
                }
              }}
            >
              <Heart className="h-4 w-4" />
            </Button>
            <Button
              className="flex-1"
              onClick={addToCart}
              disabled={product.stock_quantity === 0}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {product.stock_quantity === 0 ? 'Produto Esgotado' : 'Adicionar ao Carrinho'}
            </Button>
          </div>

          {/* Informações Adicionais */}
          {(product.materials?.length > 0 || product.care_instructions) && (
            <>
              <Separator />
              <Card>
                <CardContent className="p-4">
                  {product.materials && product.materials.length > 0 && (
                    <div className="mb-3">
                      <h4 className="font-semibold mb-2">Materiais</h4>
                      <p className="text-sm text-muted-foreground">
                        {product.materials.join(', ')}
                      </p>
                    </div>
                  )}
                  {product.care_instructions && (
                    <div>
                      <h4 className="font-semibold mb-2">Cuidados</h4>
                      <p className="text-sm text-muted-foreground">
                        {product.care_instructions}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {/* Seção de Avaliações */}
          <div className="mt-8">
            <ProductReviews productId={product.id} />
          </div>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetail;