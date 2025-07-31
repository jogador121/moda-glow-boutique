import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Sparkles } from "lucide-react";

const Newsletter = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription
    console.log("Newsletter subscription:", email);
    setEmail("");
  };

  return (
    <section className="py-20 gradient-card">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-primary/10 rounded-full p-4">
            <Mail className="h-8 w-8 text-primary" />
          </div>
        </div>

        {/* Header */}
        <h2 className="text-3xl md:text-4xl font-display font-semibold text-luxury mb-4">
          Seja a Primeira a Saber
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Receba as novidades da nossa coleção, promoções exclusivas e dicas de estilo diretamente no seu e-mail
        </p>

        {/* Newsletter Form */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-8">
          <Input
            type="email"
            placeholder="Seu melhor e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 h-12 border-border/50 focus:border-primary"
            required
          />
          <Button type="submit" className="h-12 px-8 group">
            <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform" />
            Inscrever-se
          </Button>
        </form>

        {/* Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span>Promoções Exclusivas</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span>Lançamentos em Primeira Mão</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span>Dicas de Styling</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;