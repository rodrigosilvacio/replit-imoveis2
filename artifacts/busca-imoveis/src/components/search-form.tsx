import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { Search, Loader2, Sparkles } from "lucide-react";
import { useSearchProperties, useParseSearchPreferences } from "@workspace/api-client-react";
import type { SearchFilters, ParsePreferencesInput } from "@workspace/api-client-react";
import { useSearchStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const searchFormSchema = z.object({
  operationType: z.enum(["venda", "locacao"]),
  propertyType: z.enum(["apartamento", "casa", "studio", "terreno", "comercial"]),
  city: z.string().min(1, "A cidade é obrigatória"),
  neighborhood: z.string().optional().nullable(),
  minPrice: z.coerce.number().positive("O valor deve ser positivo").optional().or(z.literal("").transform(() => null)),
  maxPrice: z.coerce.number().positive("O valor deve ser positivo").optional().or(z.literal("").transform(() => null)),
  minBedrooms: z.coerce.number().min(0).optional().or(z.literal("").transform(() => null)),
  minBathrooms: z.coerce.number().min(0).optional().or(z.literal("").transform(() => null)),
  minParkingSpots: z.coerce.number().min(0).optional().or(z.literal("").transform(() => null)),
  minArea: z.coerce.number().positive().optional().or(z.literal("").transform(() => null)),
  freeText: z.string().optional().nullable(),
});

type SearchFormValues = z.infer<typeof searchFormSchema>;

export function SearchForm() {
  const [, setLocation] = useLocation();
  const { filters, setFilters, setResults, setIsSearching, setSearchStatus } = useSearchStore();
  const { toast } = useToast();

  const parsePreferences = useParseSearchPreferences();
  const searchProperties = useSearchProperties();

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      operationType: (filters.operationType as "venda" | "locacao") || "venda",
      propertyType: (filters.propertyType as any) || "apartamento",
      city: filters.city || "",
      neighborhood: filters.neighborhood || "",
      minPrice: filters.minPrice || ("" as any),
      maxPrice: filters.maxPrice || ("" as any),
      minBedrooms: filters.minBedrooms || ("" as any),
      minBathrooms: filters.minBathrooms || ("" as any),
      minParkingSpots: filters.minParkingSpots || ("" as any),
      minArea: filters.minArea || ("" as any),
      freeText: filters.freeText || "",
    },
  });

  async function onSubmit(data: SearchFormValues) {
    try {
      setIsSearching(true);
      setFilters(data as Partial<SearchFilters>);
      
      let finalFilters: SearchFilters = data as SearchFilters;

      if (data.freeText && data.freeText.trim().length > 0) {
        setSearchStatus("Analisando suas preferências com IA...");
        const parseInput: ParsePreferencesInput = {
          freeText: data.freeText,
          operationType: data.operationType,
          propertyType: data.propertyType,
          city: data.city,
          neighborhood: data.neighborhood,
          minPrice: data.minPrice,
          maxPrice: data.maxPrice,
          minBedrooms: data.minBedrooms,
          minBathrooms: data.minBathrooms,
          minParkingSpots: data.minParkingSpots,
          minArea: data.minArea,
        };
        
        finalFilters = await parsePreferences.mutateAsync({ data: parseInput });
        setFilters(finalFilters);
      }

      setSearchStatus("Buscando imóveis no ZAP Imóveis, Viva Real, OLX e ImovelWeb...");
      
      const results = await searchProperties.mutateAsync({ data: finalFilters });
      
      setResults(results);
      setLocation("/results");
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro na busca",
        description: "Não foi possível buscar os imóveis. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
      setSearchStatus("");
    }
  }

  const isPending = parsePreferences.isPending || searchProperties.isPending;

  return (
    <div className="bg-card rounded-xl shadow-lg border border-card-border overflow-hidden">
      <div className="p-6 md:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4 text-foreground">O que você procura?</h3>
                  
                  <FormField
                    control={form.control}
                    name="operationType"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Tipo de operação</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex space-x-4"
                          >
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="venda" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                Comprar
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="locacao" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                Alugar
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de imóvel</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo de imóvel" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="apartamento">Apartamento</SelectItem>
                          <SelectItem value="casa">Casa</SelectItem>
                          <SelectItem value="studio">Studio</SelectItem>
                          <SelectItem value="terreno">Terreno</SelectItem>
                          <SelectItem value="comercial">Comercial</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: São Paulo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="neighborhood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bairro ou região</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Pinheiros" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4 text-foreground">Filtros opcionais</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="minPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor mínimo (R$)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Ex: 2000" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="maxPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor máximo (R$)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Ex: 5000" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="minBedrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quartos</FormLabel>
                        <Select
                          onValueChange={(v) => field.onChange(v === "any" ? null : Number(v))}
                          value={field.value != null ? field.value.toString() : "any"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Qualquer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="any">Qualquer</SelectItem>
                            <SelectItem value="1">1+</SelectItem>
                            <SelectItem value="2">2+</SelectItem>
                            <SelectItem value="3">3+</SelectItem>
                            <SelectItem value="4">4+</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="minBathrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Banheiros</FormLabel>
                        <Select
                          onValueChange={(v) => field.onChange(v === "any" ? null : Number(v))}
                          value={field.value != null ? field.value.toString() : "any"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Qualquer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="any">Qualquer</SelectItem>
                            <SelectItem value="1">1+</SelectItem>
                            <SelectItem value="2">2+</SelectItem>
                            <SelectItem value="3">3+</SelectItem>
                            <SelectItem value="4">4+</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="minParkingSpots"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vagas</FormLabel>
                        <Select
                          onValueChange={(v) => field.onChange(v === "any" ? null : Number(v))}
                          value={field.value != null ? field.value.toString() : "any"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Qualquer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="any">Qualquer</SelectItem>
                            <SelectItem value="1">1+</SelectItem>
                            <SelectItem value="2">2+</SelectItem>
                            <SelectItem value="3">3+</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="bg-primary/5 rounded-xl p-6 border border-primary/20">
              <FormField
                control={form.control}
                name="freeText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-primary-foreground font-semibold text-base mb-2">
                      <Sparkles className="w-5 h-5 mr-2 text-primary" />
                      <span className="text-primary">Busca Inteligente</span>
                    </FormLabel>
                    <FormDescription className="text-muted-foreground mb-4">
                      Descreva como você quer o imóvel. Nossa inteligência artificial vai entender e ajustar a busca.
                    </FormDescription>
                    <FormControl>
                      <Textarea 
                        placeholder="Ex: quero um apartamento perto do metrô, com varanda espaçosa, até R$ 4.000 por mês, na região da Vila Mariana ou Pinheiros..." 
                        className="resize-none min-h-[100px] border-primary/30 focus-visible:ring-primary/50"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 text-lg font-semibold hover-elevate shadow-md transition-all duration-300 active:scale-[0.99]" 
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  Buscando propriedades...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-6 w-6" />
                  Buscar Imóveis
                </>
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
