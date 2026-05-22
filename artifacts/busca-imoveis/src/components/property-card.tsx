import { MapPin, BedDouble, Bath, Car, Maximize, ExternalLink } from "lucide-react";
import type { Property } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const formatCurrency = (value: number | null) => {
    if (value === null) return "Preço sob consulta";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getSourceColor = (source: string) => {
    const s = source.toLowerCase();
    if (s.includes("zap")) return "bg-orange-500";
    if (s.includes("viva")) return "bg-blue-600";
    if (s.includes("olx")) return "bg-purple-600";
    if (s.includes("imovelweb")) return "bg-red-500";
    return "bg-slate-600";
  };

  return (
    <Card className="overflow-hidden flex flex-col h-full hover-elevate transition-all duration-300 border-card-border shadow-sm hover:shadow-md">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {property.imageUrl ? (
          <img
            src={property.imageUrl}
            alt={property.title}
            className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 bg-secondary/10">
            <Maximize className="w-12 h-12 mb-2" />
            <span>Sem imagem</span>
          </div>
        )}
        
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <Badge className="bg-background/90 text-foreground backdrop-blur-sm shadow-sm border-none font-semibold uppercase tracking-wider text-xs px-2 py-1">
            {property.operationType === "venda" ? "Venda" : "Locação"}
          </Badge>
          <Badge variant="secondary" className="bg-primary/90 text-primary-foreground backdrop-blur-sm shadow-sm border-none font-medium capitalize text-xs px-2 py-1">
            {property.propertyType}
          </Badge>
        </div>
        
        <Badge 
          className={`absolute bottom-3 right-3 text-white backdrop-blur-sm shadow-sm border-none ${getSourceColor(property.sourcePortal)}`}
        >
          {property.sourcePortal}
        </Badge>
      </div>

      <CardHeader className="p-4 pb-2 space-y-1">
        <div className="flex justify-between items-start gap-4">
          <div className="font-bold text-2xl tracking-tight text-foreground truncate">
            {property.priceText || formatCurrency(property.price)}
          </div>
        </div>
        <h3 className="font-medium text-sm text-foreground/90 line-clamp-2 leading-snug">
          {property.title}
        </h3>
      </CardHeader>

      <CardContent className="p-4 pt-2 flex-grow flex flex-col justify-between">
        <div className="flex items-start text-sm text-muted-foreground mb-4">
          <MapPin className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0 text-primary/70" />
          <span className="line-clamp-2">
            {[property.neighborhood, property.city].filter(Boolean).join(", ")}
            {property.address ? ` - ${property.address}` : ""}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 mt-auto border-t border-border pt-4">
          {property.area !== null && (
            <div className="flex flex-col items-center justify-center text-center">
              <Maximize className="w-4 h-4 text-muted-foreground mb-1" />
              <span className="text-xs font-semibold text-foreground">{property.area} <span className="text-[10px] font-normal text-muted-foreground">m²</span></span>
            </div>
          )}
          {property.bedrooms !== null && (
            <div className="flex flex-col items-center justify-center text-center border-l border-border pl-2">
              <BedDouble className="w-4 h-4 text-muted-foreground mb-1" />
              <span className="text-xs font-semibold text-foreground">{property.bedrooms}</span>
            </div>
          )}
          {property.bathrooms !== null && (
            <div className="flex flex-col items-center justify-center text-center border-l border-border pl-2">
              <Bath className="w-4 h-4 text-muted-foreground mb-1" />
              <span className="text-xs font-semibold text-foreground">{property.bathrooms}</span>
            </div>
          )}
          {property.parkingSpots !== null && (
            <div className="flex flex-col items-center justify-center text-center border-l border-border pl-2">
              <Car className="w-4 h-4 text-muted-foreground mb-1" />
              <span className="text-xs font-semibold text-foreground">{property.parkingSpots}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button 
          asChild 
          className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-medium"
        >
          <a href={property.sourceUrl} target="_blank" rel="noopener noreferrer">
            Ver anúncio completo
            <ExternalLink className="w-4 h-4 ml-2" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
