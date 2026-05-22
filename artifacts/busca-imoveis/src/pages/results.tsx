import { useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, SearchX, Home } from "lucide-react";
import { useSearchStore } from "@/lib/store";
import { PropertyCard } from "@/components/property-card";
import { Button } from "@/components/ui/button";

export function ResultsPage() {
  const [, setLocation] = useLocation();
  const { results, filters, isSearching } = useSearchStore();

  useEffect(() => {
    // Se não tiver resultados e não estiver buscando, volta pra home
    if (!results && !isSearching) {
      setLocation("/");
    }
  }, [results, isSearching, setLocation]);

  if (!results) return null;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-muted/30">
      <header className="bg-background border-b border-border sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <Home className="w-6 h-6" />
            <span className="font-bold text-xl tracking-tight text-foreground hidden sm:block">
              Busca<span className="text-primary">Inteligente</span>
            </span>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 hover:bg-muted"
          >
            <ArrowLeft className="w-4 h-4" />
            Nova busca
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Resultados da busca
          </h1>
          <p className="text-muted-foreground">
            Encontramos <strong className="text-foreground">{results.total}</strong> imóveis para você em {filters.city}
          </p>
        </div>

        {results.properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-xl border border-card-border shadow-sm">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6 text-muted-foreground">
              <SearchX className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Nenhum imóvel encontrado</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8 text-lg">
              Não encontramos nenhum imóvel que corresponda exatamente aos seus filtros. Tente expandir sua busca.
            </p>
            <Button size="lg" onClick={() => setLocation("/")}>
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar e editar filtros
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
