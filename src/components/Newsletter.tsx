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
        <h2 className="text-2xl xs:text-3xl md:text-4xl font-display font-semibold text-luxury mb-4">
          Seja a Primeira a Saber
        </h2>
        <p className="text-base xs:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto px-4">
          Receba as novidades da nossa coleção, promoções exclusivas e dicas de estilo diretamente no seu e-mail
        </p>

        {/* Newsletter Form */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-8 px-4">
          <Input
            type="email"
            placeholder="Seu melhor e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 h-12 min-h-[48px] border-border/50 focus:border-primary text-base"
            required
          />
          <Button type="submit" className="h-12 min-h-[48px] px-6 xs:px-8 group w-full sm:w-auto">
            <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform mr-2" />
            Inscrever-se
          </Button>
        </form>

        {/* Benefits */}
        <div className="grid grid-cols-1 xs:grid-cols-3 gap-4 xs:gap-6 text-xs xs:text-sm text-muted-foreground px-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
            <span>Promoções Exclusivas</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
            <span>Lançamentos em Primeira Mão</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
            <span>Dicas de Styling</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;