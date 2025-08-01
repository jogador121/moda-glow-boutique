import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Search as SearchIcon, Filter, X, Heart, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import { Link } from "react-router-dom";
import StarRating from "@/components/ui/star-rating";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

interface Product {
  id: string;
  name: string;
  price: number;
  compare_price: number | null;
  images: string[];
  slug: string;
  is_featured: boolean;
  stock_quantity: number;
  categories?: {
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
}

const Search = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { addToCart, isAdding } = useCart();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [inStock, setInStock] = useState(false);
  const [featured, setFeatured] = useState(false);

  // Buscar categorias
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as Category[];
    },
  });

  // Buscar produtos com filtros
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['search-products', searchTerm, selectedCategory, priceRange, sortBy, inStock, featured],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          compare_price,
          images,
          slug,
          is_featured,
          stock_quantity,
          categories (
            name
          )
        `)
        .eq('is_active', true)
        .gte('price', priceRange[0])
        .lte('price', priceRange[1]);

      // Filtro de busca por nome
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      // Filtro por categoria
      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      // Filtro por estoque
      if (inStock) {
        query = query.gt('stock_quantity', 0);
      }

      // Filtro por produtos em destaque
      if (featured) {
        query = query.eq('is_featured', true);
      }

      // Ordenação
      switch (sortBy) {
        case 'price_asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        default:
          query = query.order('name', { ascending: true });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Product[];
    },
  });

  // Função para adicionar ao carrinho
  const handleAddToCart = (productId: string) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para adicionar produtos ao carrinho",
        variant: "destructive",
      });
      return;
    }

    addToCart.mutate({ 
      productId,
      quantity: 1 
    });
  };

  // Adicionar à wishlist
  const addToWishlist = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('wishlists')
        .insert({
          user_id: user.id,
          product_id: productId,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Adicionado aos favoritos",
        description: "O produto foi adicionado à sua lista de desejos.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar aos favoritos. Faça login para continuar.",
        variant: "destructive",
      });
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setPriceRange([0, 1000]);
    setSortBy("name");
    setInStock(false);
    setFeatured(false);
  };

  const hasActiveFilters = 
    searchTerm || 
    selectedCategory !== 'all' || 
    priceRange[0] > 0 || 
    priceRange[1] < 1000 || 
    inStock || 
    featured;

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Cabeçalho */}
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold text-foreground mb-4">
              Buscar Produtos
            </h1>
            
            {/* Barra de Busca */}
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Digite o nome do produto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filtros
                {hasActiveFilters && (
                  <Badge variant="destructive" className="ml-1">
                    !
                  </Badge>
                )}
              </Button>
            </div>

            {/* Filtros */}
            {showFilters && (
              <Card className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Filtros</h3>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-1" />
                      Limpar Filtros
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Categoria */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Categoria</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as Categorias</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Ordenação */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Ordenar por</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Nome A-Z</SelectItem>
                        <SelectItem value="price_asc">Menor Preço</SelectItem>
                        <SelectItem value="price_desc">Maior Preço</SelectItem>
                        <SelectItem value="newest">Mais Recentes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Preço */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Faixa de Preço: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                    </label>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={1000}
                      step={10}
                    />
                  </div>

                  {/* Outros Filtros */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="inStock"
                        checked={inStock}
                        onCheckedChange={(checked) => setInStock(checked === true)}
                      />
                      <label htmlFor="inStock" className="text-sm">
                        Apenas em estoque
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="featured"
                        checked={featured}
                        onCheckedChange={(checked) => setFeatured(checked === true)}
                      />
                      <label htmlFor="featured" className="text-sm">
                        Produtos em destaque
                      </label>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Resultados */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-muted-foreground">
                {isLoading ? 'Buscando...' : `${products.length} produto(s) encontrado(s)`}
              </p>
            </div>
          </div>

          {/* Grid de Produtos */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <div className="aspect-square bg-muted rounded-t-lg"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-6 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <SearchIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Nenhum produto encontrado
              </h2>
              <p className="text-muted-foreground mb-6">
                Tente ajustar os filtros ou buscar por outros termos
              </p>
              {hasActiveFilters && (
                <Button onClick={clearFilters}>
                  Limpar Filtros
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="group hover:shadow-luxury transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="relative">
                      <Link to={`/produto/${product.slug}`}>
                        <div className="aspect-square overflow-hidden rounded-t-lg">
                          <img
                            src={product.images[0] || '/placeholder.svg'}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      </Link>
                      
                      {product.is_featured && (
                        <Badge className="absolute top-2 left-2">
                          Destaque
                        </Badge>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm hover:bg-white opacity-0 group-hover:opacity-100 transition-all"
                        onClick={() => addToWishlist.mutate(product.id)}
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="p-4">
                      <div className="mb-2">
                        {product.categories && (
                          <Badge variant="secondary" className="text-xs mb-2">
                            {product.categories.name}
                          </Badge>
                        )}
                      </div>
                      
                      <Link to={`/produto/${product.slug}`}>
                        <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                          {product.name}
                        </h3>
                      </Link>

                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg font-bold text-foreground">
                          {formatPrice(product.price)}
                        </span>
                        {product.compare_price && product.compare_price > product.price && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(product.compare_price)}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="shrink-0"
                          onClick={() => addToWishlist.mutate(product.id)}
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          className="flex-1"
                          onClick={() => handleAddToCart(product.id)}
                          disabled={product.stock_quantity === 0 || isAdding}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          {product.stock_quantity === 0 ? 'Esgotado' : isAdding ? 'Adicionando...' : 'Adicionar'}
                        </Button>
                      </div>

                      {product.stock_quantity === 0 && (
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

export default Search;