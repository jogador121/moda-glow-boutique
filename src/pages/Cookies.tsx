import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Cookies = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-display font-semibold text-luxury mb-8">
            Política de Cookies
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground mb-6">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. O que são Cookies</h2>
              <p className="text-muted-foreground">
                Cookies são pequenos arquivos de texto armazenados em seu dispositivo quando você 
                visita nosso site. Eles nos ajudam a melhorar sua experiência de navegação.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Tipos de Cookies que Utilizamos</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-foreground">Cookies Essenciais</h3>
                  <p className="text-muted-foreground">
                    Necessários para o funcionamento básico do site, incluindo autenticação e carrinho de compras.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground">Cookies de Performance</h3>
                  <p className="text-muted-foreground">
                    Coletam informações sobre como você usa nosso site para nos ajudar a melhorá-lo.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground">Cookies de Preferências</h3>
                  <p className="text-muted-foreground">
                    Lembram suas configurações e preferências para personalizar sua experiência.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. Como Controlamos os Cookies</h2>
              <p className="text-muted-foreground">
                Você pode controlar e excluir cookies através das configurações do seu navegador. 
                No entanto, desabilitar certos cookies pode afetar a funcionalidade do site.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Cookies de Terceiros</h2>
              <p className="text-muted-foreground">
                Alguns cookies podem ser definidos por serviços de terceiros que utilizamos, 
                como Google Analytics, para análise de tráfego do site.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Gerenciamento de Preferências</h2>
              <p className="text-muted-foreground">
                Para gerenciar suas preferências de cookies, acesse as configurações do seu navegador:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2">
                <li>Chrome: Configurações {'>'}  Privacidade e segurança {'>'} Cookies</li>
                <li>Firefox: Configurações {'>'} Privacidade e segurança</li>
                <li>Safari: Preferências {'>'} Privacidade</li>
                <li>Edge: Configurações {'>'} Privacidade, pesquisa e serviços</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Alterações na Política</h2>
              <p className="text-muted-foreground">
                Podemos atualizar esta política de cookies periodicamente. Recomendamos que você 
                revise esta página regularmente para se manter informado.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Contato</h2>
              <p className="text-muted-foreground">
                Para questões sobre nossa política de cookies, entre em contato: contato@modaglow.com
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cookies;