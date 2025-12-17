import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      {/* Hero Section - Área em branco para adicionar elementos */}
      <main className="flex-1 pt-16">
        <section className="hero-gradient min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="container mx-auto px-6 py-20">
            {/* 
              ÁREA VAZIA PARA ADICIONAR ELEMENTOS
              
              Adicione aqui:
              - Títulos (h1, h2)
              - Parágrafos
              - Botões
              - Imagens
              - Cards
              - Qualquer componente
            */}
            <div className="text-center animate-fade-in">
              <p className="text-muted-foreground text-lg">
                Adicione seus elementos aqui
              </p>
            </div>
          </div>
        </section>

        {/* Seções adicionais podem ser adicionadas abaixo */}
        
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
