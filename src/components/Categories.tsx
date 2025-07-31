import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Categories = () => {
  const categories = [
    {
      title: "Calçados",
      description: "Sandálias, saltos e tênis para todos os momentos",
      image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      count: "120+ produtos"
    },
    {
      title: "Vestuário",
      description: "Vestidos, blusas e saias que expressam sua personalidade",
      image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      count: "200+ produtos"
    },
    {
      title: "Acessórios",
      description: "Bolsas, joias e acessórios que completam seu look",
      image: "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      count: "180+ produtos"
    }
  ];

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <div
              key={category.title}
              className="group relative overflow-hidden rounded-xl gradient-card shadow-soft hover:shadow-luxury transition-all duration-500 hover-lift"
            >
              {/* Image */}
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-luxury/60 via-transparent to-transparent"></div>
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="mb-2">
                  <span className="text-sm font-medium text-primary-glow">
                    {category.count}
                  </span>
                </div>
                <h3 className="text-2xl font-display font-semibold mb-2">
                  {category.title}
                </h3>
                <p className="text-sm text-white/80 mb-4 line-clamp-2">
                  {category.description}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm group"
                >
                  Explorar
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button variant="luxury" size="lg" className="group">
            Ver Todos os Produtos
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Categories;