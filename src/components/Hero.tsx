import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import heroBoutique from "@/assets/hero-boutique.jpg";

const Hero = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden gradient-hero">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroBoutique} 
          alt="Elegant Boutique Interior" 
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/40 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fadeIn">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-soft mb-8 animate-scaleIn">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              Nova Coleção Primavera/Verão 2024
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-semibold text-luxury mb-6 animate-slideUp">
            Elegância que
            <span className="block text-transparent bg-gradient-primary bg-clip-text">
              Inspira Confiança
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed animate-slideUp">
            Descubra nossa coleção exclusiva de moda feminina, onde cada peça conta uma história de sofisticação e estilo autêntico.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slideUp">
            <Button variant="hero" size="hero" className="group">
              Explorar Coleção
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg" className="hover-lift">
              Ver Lookbook
            </Button>
          </div>

          {/* Stats */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mt-16 animate-scaleIn">
            <div className="text-center">
              <div className="text-2xl font-display font-semibold text-luxury">500+</div>
              <div className="text-sm text-muted-foreground">Produtos Exclusivos</div>
            </div>
            <div className="hidden sm:block w-px h-8 bg-border"></div>
            <div className="text-center">
              <div className="text-2xl font-display font-semibold text-luxury">98%</div>
              <div className="text-sm text-muted-foreground">Clientes Satisfeitas</div>
            </div>
            <div className="hidden sm:block w-px h-8 bg-border"></div>
            <div className="text-center">
              <div className="text-2xl font-display font-semibold text-luxury">24h</div>
              <div className="text-sm text-muted-foreground">Entrega Expressa</div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-40 right-20 w-32 h-32 bg-accent/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
    </section>
  );
};

export default Hero;