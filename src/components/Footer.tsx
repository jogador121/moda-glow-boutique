import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Footer = () => {
  const { data: categories = [] } = useQuery({
    queryKey: ['categories-footer'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(6);

      if (error) throw error;
      return data || [];
    },
  });

  return (
    <footer className="bg-luxury text-luxury-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 xs:py-16 grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-6 xs:gap-8">
          {/* Brand Section */}
          <div className="xs:col-span-2 lg:col-span-1">
            <Link to="/">
              <h3 className="text-xl xs:text-2xl font-display font-semibold mb-4 hover:text-primary transition-colors">
                Moda Glow
              </h3>
            </Link>
            <p className="text-luxury-foreground/70 mb-6 leading-relaxed text-sm xs:text-base">
              Sua boutique online de moda feminina, onde elegância e sofisticação se encontram para criar looks únicos e inspiradores.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="hover:bg-white/10 min-h-[44px] min-w-[44px]">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-white/10 min-h-[44px] min-w-[44px]">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-white/10 min-h-[44px] min-w-[44px]">
                <Twitter className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Categories - Only show if there are categories */}
          {categories.length > 0 && (
            <div>
              <h4 className="font-semibold mb-4">Categorias</h4>
              <ul className="space-y-2">
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link 
                      to={`/produtos?categoria=${category.slug}`}
                      className="text-luxury-foreground/70 hover:text-white transition-colors"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Legal Pages */}
          <div>
            <h4 className="font-semibold mb-4">Páginas</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/termos" className="text-luxury-foreground/70 hover:text-white transition-colors">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link to="/politica-privacidade" className="text-luxury-foreground/70 hover:text-white transition-colors">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-luxury-foreground/70 hover:text-white transition-colors">
                  Política de Cookies
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">Contato</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-luxury-foreground/70">(11) 99999-9999</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-luxury-foreground/70">contato@modaglow.com</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-luxury-foreground/70">São Paulo, SP - Brasil</span>
              </div>
            </div>

            {/* Opening Hours */}
            <div className="mt-6">
              <h5 className="font-medium mb-2">Atendimento Online</h5>
              <p className="text-sm text-luxury-foreground/70">
                Segunda a Sexta: 9h às 18h<br />
                Sábado: 9h às 15h
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-6 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs xs:text-sm text-luxury-foreground/70 text-center md:text-left">
              © 2024 Moda Glow. Todos os direitos reservados.
            </p>
            <div className="flex flex-col xs:flex-row items-center gap-4 xs:gap-6 text-xs xs:text-sm">
              <Link to="/termos" className="text-luxury-foreground/70 hover:text-white transition-colors min-h-[44px] flex items-center">
                Termos de Uso
              </Link>
              <Link to="/politica-privacidade" className="text-luxury-foreground/70 hover:text-white transition-colors min-h-[44px] flex items-center">
                Política de Privacidade
              </Link>
              <Link to="/cookies" className="text-luxury-foreground/70 hover:text-white transition-colors min-h-[44px] flex items-center">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;