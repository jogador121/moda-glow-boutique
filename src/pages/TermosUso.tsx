import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const TermosUso = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-display font-semibold text-luxury mb-8">
            Termos de Uso
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground mb-6">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Aceitação dos Termos</h2>
              <p className="text-muted-foreground">
                Ao acessar e utilizar o site Moda Glow, você concorda em cumprir estes Termos de Uso. 
                Se você não concordar com algum destes termos, não deverá utilizar nossos serviços.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Descrição do Serviço</h2>
              <p className="text-muted-foreground">
                Moda Glow é uma boutique online especializada em moda feminina, oferecendo produtos 
                de qualidade com foco em elegância e sofisticação.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. Cadastro e Conta de Usuário</h2>
              <p className="text-muted-foreground">
                Para utilizar determinados recursos, você deve criar uma conta fornecendo informações 
                precisas e atualizadas. Você é responsável por manter a confidencialidade de sua senha.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Política de Compras</h2>
              <p className="text-muted-foreground">
                Todos os preços estão sujeitos a alterações sem aviso prévio. Reservamo-nos o direito 
                de cancelar pedidos em caso de erro de preço ou indisponibilidade do produto.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Propriedade Intelectual</h2>
              <p className="text-muted-foreground">
                Todo o conteúdo do site, incluindo textos, imagens, logos e design, é propriedade 
                da Moda Glow e está protegido por leis de direitos autorais.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Limitação de Responsabilidade</h2>
              <p className="text-muted-foreground">
                A Moda Glow não se responsabiliza por danos indiretos ou consequenciais decorrentes 
                do uso de nossos serviços.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Contato</h2>
              <p className="text-muted-foreground">
                Para questões relacionadas aos Termos de Uso, entre em contato conosco através do 
                e-mail: contato@modaglow.com
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermosUso;