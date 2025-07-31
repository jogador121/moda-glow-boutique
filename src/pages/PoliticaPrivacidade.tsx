import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const PoliticaPrivacidade = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-display font-semibold text-luxury mb-8">
            Política de Privacidade
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground mb-6">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Informações que Coletamos</h2>
              <p className="text-muted-foreground">
                Coletamos informações que você nos fornece diretamente, como nome, e-mail, endereço 
                e informações de pagamento quando você cria uma conta ou faz uma compra.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Como Usamos suas Informações</h2>
              <p className="text-muted-foreground">
                Utilizamos suas informações para processar pedidos, fornecer suporte ao cliente, 
                enviar atualizações sobre produtos e melhorar nossos serviços.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. Compartilhamento de Informações</h2>
              <p className="text-muted-foreground">
                Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, 
                exceto quando necessário para processar pagamentos ou cumprir obrigações legais.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Segurança dos Dados</h2>
              <p className="text-muted-foreground">
                Implementamos medidas de segurança adequadas para proteger suas informações pessoais 
                contra acesso não autorizado, alteração ou divulgação.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Seus Direitos</h2>
              <p className="text-muted-foreground">
                Você tem o direito de acessar, corrigir ou excluir suas informações pessoais. 
                Entre em contato conosco para exercer esses direitos.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Cookies</h2>
              <p className="text-muted-foreground">
                Utilizamos cookies para melhorar sua experiência de navegação. Você pode configurar 
                seu navegador para recusar cookies, mas isso pode afetar a funcionalidade do site.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Alterações na Política</h2>
              <p className="text-muted-foreground">
                Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças 
                significativas através do site ou por e-mail.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Contato</h2>
              <p className="text-muted-foreground">
                Para questões sobre esta Política de Privacidade, entre em contato: contato@modaglow.com
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PoliticaPrivacidade;