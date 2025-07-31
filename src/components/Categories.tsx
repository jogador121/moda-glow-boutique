import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  slug: string;
  product_count: number;
}

const Categories = () => {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories-home'],
    queryFn: async () => {
      // Buscar categorias com contagem de produtos
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select(`
          id,
          name,
          description,
          image_url,
          slug,
          display_order
        `)
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(6);

      if (categoriesError) throw categoriesError;

      if (!categoriesData || categoriesData.length === 0) {
        return [];
      }

      // Buscar contagem de produtos para cada categoria
      const categoriesWithCount = await Promise.all(
        categoriesData.map(async (category) => {
          const { count, error: countError } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id)
            .eq('is_active', true);

          if (countError) {
            console.error('Erro ao contar produtos:', countError);
          }

          return {
            ...category,
            product_count: count || 0,
          };
        })
      );

      return categoriesWithCount;
    },
  });

  if (isLoading) {
    return (
      <section className="py-20 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-semibold text-luxury mb-4">
              Nossas Categorias
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore nossa curadoria especial de produtos selecionados para realçar sua beleza única
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-[4/5] bg-muted rounded-xl mb-4" />
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Se não há categorias, não renderizar a seção
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-semibold text-luxury mb-4">
            Nossas Categorias
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore nossa curadoria especial de produtos selecionados para realçar sua beleza única
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.slice(0, 6).map((category) => (
            <div
              key={category.id}
              className="group relative overflow-hidden rounded-xl gradient-card shadow-soft hover:shadow-luxury transition-all duration-500 hover-lift"
            >
              {/* Image */}
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={category.image_url || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-luxury/60 via-transparent to-transparent"></div>
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="mb-2">
                  <span className="text-sm font-medium text-primary-glow">
                    {category.product_count} produto{category.product_count !== 1 ? 's' : ''}
                  </span>
                </div>
                <h3 className="text-2xl font-display font-semibold mb-2">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-sm text-white/80 mb-4 line-clamp-2">
                    {category.description}
                  </p>
                )}
                <Button 
                  asChild
                  variant="outline" 
                  size="sm" 
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm group"
                >
                  <Link to={`/produtos?categoria=${category.slug}`}>
                    Explorar
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button asChild variant="luxury" size="lg" className="group">
            <Link to="/produtos">
              Ver Todos os Produtos
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Categories;