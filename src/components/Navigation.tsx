import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ShoppingBag, Menu, X, Heart, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { UserMenu } from "./auth/UserMenu";
import NavLinkItem from "@/components/ui/NavLinkItem";
import IconButtonWithBadge from "@/components/ui/IconButtonWithBadge";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();

  const { data: cartItemsCount = 0 } = useQuery({
    queryKey: ['cart-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;

      const { count, error } = await supabase
        .from('cart_items')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories-nav'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(4);

      if (error) throw error;
      return data || [];
    },
  });

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/">
              <h1 className="text-xl xs:text-2xl font-display font-semibold text-luxury hover:text-primary transition-smooth cursor-pointer">
                Moda Glow
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <NavLinkItem to="/produtos" label="Produtos" />
              {categories.map((category) => (
                <NavLinkItem
                  key={category.id}
                  to={`/produtos?categoria=${category.slug}`}
                  label={category.name}
                />
              ))}
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <IconButtonWithBadge to="/buscar" icon={Search} ariaLabel="Buscar" />
            <IconButtonWithBadge to="/wishlist" icon={Heart} ariaLabel="Lista de Desejos" />
            <IconButtonWithBadge to="/carrinho" icon={ShoppingCart} badgeContent={cartItemsCount} ariaLabel="Carrinho de Compras" />
            <UserMenu />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu} className="min-h-[44px] min-w-[44px]">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden animate-slideUp">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-card rounded-lg mt-2 shadow-elegant">
              <div className="flex justify-center space-x-6 mb-6">
                <IconButtonWithBadge to="/buscar" icon={Search} ariaLabel="Buscar" onClick={toggleMenu} />
                <IconButtonWithBadge to="/wishlist" icon={Heart} ariaLabel="Lista de Desejos" onClick={toggleMenu} />
                <IconButtonWithBadge to="/carrinho" icon={ShoppingCart} badgeContent={cartItemsCount} ariaLabel="Carrinho de Compras" onClick={toggleMenu} />
                <UserMenu />
              </div>
              <NavLinkItem to="/produtos" label="Produtos" isMobile onClick={toggleMenu} />
              {categories.map((category) => (
                <NavLinkItem
                  key={category.id}
                  to={`/produtos?categoria=${category.slug}`}
                  label={category.name}
                  isMobile
                  onClick={toggleMenu}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;