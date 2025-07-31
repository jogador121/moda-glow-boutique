import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, Star } from "lucide-react";

const FeaturedProducts = () => {
  const products = [
    {
      id: 1,
      name: "Vestido Midi Floral",
      price: 249.90,
      originalPrice: 329.90,
      image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      rating: 4.8,
      reviews: 124,
      badge: "Bestseller"
    },
    {
      id: 2,
      name: "Sandália de Salto Alto",
      price: 189.90,
      originalPrice: null,
      image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      rating: 4.9,
      reviews: 89,
      badge: "Novo"
    },
    {
      id: 3,
      name: "Bolsa de Couro Premium",
      price: 399.90,
      originalPrice: 499.90,
      image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      rating: 4.7,
      reviews: 156,
      badge: "Oferta"
    },
    {
      id: 4,
      name: "Blusa de Seda Premium",
      price: 159.90,
      originalPrice: null,
      image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      rating: 4.6,
      reviews: 203,
      badge: "Tendência"
    }
  ];

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case "Bestseller": return "bg-luxury text-luxury-foreground";
      case "Novo": return "bg-accent text-accent-foreground";
      case "Oferta": return "bg-destructive text-destructive-foreground";
      case "Tendência": return "bg-primary text-primary-foreground";
      default: return "bg-muted text-muted-foreground";
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="group relative bg-card rounded-xl overflow-hidden shadow-soft hover:shadow-luxury transition-all duration-500 hover-lift"
            >
              {/* Badge */}
              {product.badge && (
                <div className={`absolute top-3 left-3 z-10 px-2 py-1 rounded-md text-xs font-medium ${getBadgeColor(product.badge)}`}>
                  {product.badge}
                </div>
              )}

              {/* Wishlist Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 z-10 bg-white/80 backdrop-blur-sm hover:bg-white opacity-0 group-hover:opacity-100 transition-all duration-300"
              >
                <Heart className="h-4 w-4" />
              </Button>

              {/* Product Image */}
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>

              {/* Product Info */}
              <div className="p-4">
                {/* Rating */}
                <div className="flex items-center gap-1 mb-2">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium text-foreground ml-1">
                      {product.rating}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ({product.reviews})
                  </span>
                </div>

                {/* Product Name */}
                <h3 className="font-medium text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {product.name}
                </h3>

                {/* Price */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg font-semibold text-luxury">
                    R$ {product.price.toFixed(2)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      R$ {product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Add to Cart Button */}
                <Button
                  className="w-full group opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                  variant="default"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Adicionar ao Carrinho
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* View More Button */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="hover-lift">
            Ver Mais Produtos
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;