import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" className="font-display text-xl font-semibold text-foreground">
          Logo
        </a>
        
        <nav className="hidden md:flex items-center gap-8">
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
            Início
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
            Sobre
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
            Serviços
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
            Contato
          </a>
        </nav>

        <Button variant="default" size="sm">
          Começar
        </Button>
      </div>
    </header>
  );
};

export default Header;
