import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-luxury text-luxury-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-display font-semibold mb-4">Moda Glow</h3>
            <p className="text-luxury-foreground/70 mb-6 leading-relaxed">
              Sua boutique online de moda feminina, onde elegância e sofisticação se encontram para criar looks únicos e inspiradores.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="hover:bg-white/10">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-white/10">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-white/10">
                <Twitter className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4">Categorias</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-luxury-foreground/70 hover:text-white transition-colors">Vestidos</a></li>
              <li><a href="#" className="text-luxury-foreground/70 hover:text-white transition-colors">Blusas & Tops</a></li>
              <li><a href="#" className="text-luxury-foreground/70 hover:text-white transition-colors">Calças & Saias</a></li>
              <li><a href="#" className="text-luxury-foreground/70 hover:text-white transition-colors">Calçados</a></li>
              <li><a href="#" className="text-luxury-foreground/70 hover:text-white transition-colors">Acessórios</a></li>
              <li><a href="#" className="text-luxury-foreground/70 hover:text-white transition-colors">Bolsas</a></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold mb-4">Atendimento</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-luxury-foreground/70 hover:text-white transition-colors">Central de Ajuda</a></li>
              <li><a href="#" className="text-luxury-foreground/70 hover:text-white transition-colors">Trocas e Devoluções</a></li>
              <li><a href="#" className="text-luxury-foreground/70 hover:text-white transition-colors">Guia de Tamanhos</a></li>
              <li><a href="#" className="text-luxury-foreground/70 hover:text-white transition-colors">Formas de Pagamento</a></li>
              <li><a href="#" className="text-luxury-foreground/70 hover:text-white transition-colors">Entregas</a></li>
              <li><a href="#" className="text-luxury-foreground/70 hover:text-white transition-colors">Política de Privacidade</a></li>
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
            <p className="text-sm text-luxury-foreground/70">
              © 2024 Moda Glow. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <a href="#" className="text-luxury-foreground/70 hover:text-white transition-colors">
                Termos de Uso
              </a>
              <a href="#" className="text-luxury-foreground/70 hover:text-white transition-colors">
                Política de Privacidade
              </a>
              <a href="#" className="text-luxury-foreground/70 hover:text-white transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;