import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, ShoppingBag, Menu, X, Heart } from "lucide-react";
import { UserMenu } from "./auth/UserMenu";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-display font-semibold text-luxury">
              Moda Glow
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a href="#" className="text-foreground hover:text-primary transition-smooth font-medium">
                Novidades
              </a>
              <a href="#" className="text-foreground hover:text-primary transition-smooth font-medium">
                Calçados
              </a>
              <a href="#" className="text-foreground hover:text-primary transition-smooth font-medium">
                Vestuário
              </a>
              <a href="#" className="text-foreground hover:text-primary transition-smooth font-medium">
                Acessórios
              </a>
              <a href="#" className="text-foreground hover:text-primary transition-smooth font-medium">
                Promoções
              </a>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="hover-lift">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hover-lift">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hover-lift relative">
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </Button>
            <UserMenu />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden animate-slideUp">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-card rounded-lg mt-2 shadow-elegant">
              <div className="flex justify-center space-x-4 mb-4">
                <Button variant="ghost" size="icon" className="hover-lift">
                  <Search className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="hover-lift">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="hover-lift relative">
                  <ShoppingBag className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    0
                  </span>
                </Button>
                <UserMenu />
              </div>
              <a href="#" className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-accent rounded-md transition-smooth">
                Novidades
              </a>
              <a href="#" className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-accent rounded-md transition-smooth">
                Calçados
              </a>
              <a href="#" className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-accent rounded-md transition-smooth">
                Vestuário
              </a>
              <a href="#" className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-accent rounded-md transition-smooth">
                Acessórios
              </a>
              <a href="#" className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-accent rounded-md transition-smooth">
                Promoções
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;