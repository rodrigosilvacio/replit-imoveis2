import { SearchForm } from "@/components/search-form";
import { Building2, Sparkles, Map, Home } from "lucide-react";
import { useSearchStore } from "@/lib/store";
import { Loader2 } from "lucide-react";

export function SearchPage() {
  const { isSearching, searchStatus } = useSearchStore();

  if (isSearching) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background p-6">
        <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Buscando seu imóvel ideal
            </h2>
            <p className="text-muted-foreground text-lg">
              {searchStatus || "Processando suas preferências..."}
            </p>
          </div>

          <div className="grid grid-cols-4 gap-4 opacity-50">
            <div className="h-2 bg-primary/20 rounded animate-pulse delay-75"></div>
            <div className="h-2 bg-primary/40 rounded animate-pulse delay-150"></div>
            <div className="h-2 bg-primary/60 rounded animate-pulse delay-300"></div>
            <div className="h-2 bg-primary/20 rounded animate-pulse delay-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-muted/30">
      <header className="bg-background border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <Home className="w-6 h-6" />
            <span className="font-bold text-xl tracking-tight text-foreground">
              Busca<span className="text-primary">Inteligente</span>
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <section className="relative py-16 md:py-24 bg-secondary overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary-foreground mb-6 backdrop-blur-sm border border-primary/30">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">Busca turbinada com IA</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-tight mb-6">
              Encontre seu imóvel ideal sem o estresse de sempre.
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8 font-light">
              Diga o que você quer e nós buscamos em todos os maiores portais imobiliários do Brasil para você.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 md:px-6 -mt-10 md:-mt-16 mb-20 relative z-20 max-w-5xl">
          <SearchForm />
        </section>

        <section className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Entende o que você diz</h3>
              <p className="text-muted-foreground">
                Escreva do seu jeito. "Quero um apartamento perto do metrô" e nós transformamos isso em filtros.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                <Map className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Busca em todo lugar</h3>
              <p className="text-muted-foreground">
                Varremos simultaneamente os maiores portais: ZAP, Viva Real, OLX e mais.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Resultados limpos</h3>
              <p className="text-muted-foreground">
                Sem anúncios repetidos ou bagunça. Apenas os imóveis que importam para você.
              </p>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-background border-t border-border py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Busca Inteligente de Imóveis. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
