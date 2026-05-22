import { Router } from "express";
import OpenAI from "openai";
import FirecrawlApp from "@mendable/firecrawl-js";
import {
  ParseSearchPreferencesBody,
  SearchPropertiesBody,
} from "@workspace/api-zod";

const router = Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });

router.post("/search/parse", async (req, res) => {
  const parsed = ParseSearchPreferencesBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Dados inválidos: " + parsed.error.message });
  }

  const {
    freeText,
    operationType,
    propertyType,
    city,
    neighborhood,
    minPrice,
    maxPrice,
    minBedrooms,
    minBathrooms,
    minParkingSpots,
    minArea,
  } = parsed.data;

  const contextData = {
    operationType: operationType ?? null,
    propertyType: propertyType ?? null,
    city: city ?? null,
    neighborhood: neighborhood ?? null,
    minPrice: minPrice ?? null,
    maxPrice: maxPrice ?? null,
    minBedrooms: minBedrooms ?? null,
    minBathrooms: minBathrooms ?? null,
    minParkingSpots: minParkingSpots ?? null,
    minArea: minArea ?? null,
  };

  const systemPrompt = `Você é um assistente especializado em imóveis brasileiros. 
Analise a preferência em texto livre do usuário e combine com os filtros já preenchidos para retornar filtros estruturados.
Sempre retorne um JSON válido com os campos exatos. Para campos não mencionados, use null.
Tipo de operação: "venda" ou "locacao". 
Tipo de imóvel: "apartamento", "casa", "studio", "terreno" ou "comercial".
Valores monetários em números inteiros (reais), sem símbolos.
Áreas em m² como número inteiro.`;

  const userPrompt = `Filtros do formulário já preenchidos:
${JSON.stringify(contextData, null, 2)}

Preferência em texto livre: "${freeText}"

Retorne APENAS um JSON válido com esta estrutura:
{
  "operationType": "venda" | "locacao",
  "propertyType": "apartamento" | "casa" | "studio" | "terreno" | "comercial",
  "city": string,
  "neighborhood": string | null,
  "minPrice": number | null,
  "maxPrice": number | null,
  "minBedrooms": number | null,
  "minBathrooms": number | null,
  "minParkingSpots": number | null,
  "minArea": number | null,
  "freeText": string | null
}

Combine as informações do formulário com o texto livre. Texto livre tem prioridade para campos que conflitem.
Inclua o texto livre original no campo freeText para uso posterior na busca.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return res.status(500).json({ error: "Resposta vazia da IA" });
    }

    const filters = JSON.parse(content);
    return res.json(filters);
  } catch (err) {
    console.error("OpenAI error:", err);
    return res.status(500).json({ error: "Erro ao interpretar preferências com IA" });
  }
});

interface FirecrawlSearchResult {
  url?: string;
  title?: string;
  description?: string;
  markdown?: string;
  metadata?: {
    ogImage?: string;
    sourceURL?: string;
    [key: string]: unknown;
  };
}

function detectPortalName(url: string): string {
  if (url.includes("zapimoveis") || url.includes("zap.viva")) return "ZAP Imóveis";
  if (url.includes("vivareal")) return "Viva Real";
  if (url.includes("olx")) return "OLX";
  if (url.includes("imovelweb")) return "ImovelWeb";
  if (url.includes("quintoandar")) return "QuintoAndar";
  if (url.includes("chaves")) return "Chaves na Mão";
  if (url.includes("123i")) return "123i";
  return "Portal Imobiliário";
}

function extractPrice(text: string): { price: number | null; priceText: string } {
  const priceMatch = text.match(/R\$\s*([\d.,]+(?:\s*mil)?(?:\s*\/\s*(?:mês|mes))?)/i);
  if (!priceMatch) return { price: null, priceText: "Consulte" };

  const raw = priceMatch[1].replace(/\./g, "").replace(",", ".");
  const isMil = raw.toLowerCase().includes("mil");
  const numStr = raw.replace(/mil/i, "").trim();
  const num = parseFloat(numStr);
  const price = isMil ? num * 1000 : num;

  return {
    price: isNaN(price) ? null : price,
    priceText: "R$ " + priceMatch[1],
  };
}

function extractNumber(text: string, patterns: RegExp[]): number | null {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const n = parseInt(match[1]);
      if (!isNaN(n)) return n;
    }
  }
  return null;
}

function parsePropertyFromResult(result: FirecrawlSearchResult, filters: {
  operationType: string;
  propertyType: string;
  city: string;
  neighborhood?: string | null;
}, index: number) {
  const text = [result.title ?? "", result.description ?? "", result.markdown ?? ""].join(" ");
  const url = result.url ?? result.metadata?.sourceURL ?? "";

  const { price, priceText } = extractPrice(text);

  const area = extractNumber(text, [
    /(\d+)\s*m[²2]/i,
    /área[:\s]+(\d+)/i,
    /(\d+)\s*metros/i,
  ]);

  const bedrooms = extractNumber(text, [
    /(\d+)\s*(?:quarto|dormitório|dorm|suíte)/i,
    /quarto[s]?[:\s]+(\d+)/i,
  ]);

  const bathrooms = extractNumber(text, [
    /(\d+)\s*banheiro/i,
    /banheiro[s]?[:\s]+(\d+)/i,
  ]);

  const parkingSpots = extractNumber(text, [
    /(\d+)\s*(?:vaga|garagem)/i,
    /vaga[s]?[:\s]+(\d+)/i,
  ]);

  const imageUrl = result.metadata?.ogImage ?? null;
  const portal = detectPortalName(url);

  const titleClean = result.title
    ? result.title.replace(/\s*[-|]\s*.*$/, "").trim().substring(0, 100)
    : `${filters.propertyType} em ${filters.city}`;

  const neighborhood = filters.neighborhood ?? null;

  return {
    id: `prop-${index}-${Date.now()}`,
    title: titleClean,
    price,
    priceText,
    propertyType: filters.propertyType,
    operationType: filters.operationType,
    city: filters.city,
    neighborhood,
    address: null,
    area,
    bedrooms,
    bathrooms,
    parkingSpots,
    imageUrl: typeof imageUrl === "string" ? imageUrl : null,
    sourcePortal: portal,
    sourceUrl: url,
    description: result.description?.substring(0, 300) ?? null,
  };
}

function buildSearchQuery(filters: {
  operationType: string;
  propertyType: string;
  city: string;
  neighborhood?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  minBedrooms?: number | null;
  minArea?: number | null;
  freeText?: string | null;
}): string {
  const operationMap: Record<string, string> = {
    venda: "venda comprar",
    locacao: "aluguel alugar",
  };
  const typeMap: Record<string, string> = {
    apartamento: "apartamento",
    casa: "casa",
    studio: "studio kitnet",
    terreno: "terreno lote",
    comercial: "comercial sala",
  };

  const parts: string[] = [];
  parts.push(typeMap[filters.propertyType] ?? filters.propertyType);
  parts.push(operationMap[filters.operationType] ?? filters.operationType);
  if (filters.neighborhood) parts.push(filters.neighborhood);
  parts.push(filters.city);
  if (filters.minBedrooms) parts.push(`${filters.minBedrooms} quartos`);
  if (filters.maxPrice) parts.push(`até R$ ${filters.maxPrice.toLocaleString("pt-BR")}`);
  if (filters.minArea) parts.push(`${filters.minArea}m²`);
  if (filters.freeText) {
    const clean = filters.freeText.substring(0, 100);
    parts.push(clean);
  }

  return parts.join(" ");
}

router.post("/search/properties", async (req, res) => {
  const parsed = SearchPropertiesBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Filtros inválidos: " + parsed.error.message });
  }

  const filters = parsed.data;
  const query = buildSearchQuery(filters);

  const portals = [
    `site:zapimoveis.com.br ${query}`,
    `site:vivareal.com.br ${query}`,
    `site:olx.com.br imoveis ${query}`,
    `site:imovelweb.com.br ${query}`,
  ];

  const allProperties: ReturnType<typeof parsePropertyFromResult>[] = [];
  let globalIndex = 0;

  try {
    for (const searchQuery of portals) {
      try {
        const searchResult = await firecrawl.search(searchQuery, {
          limit: 5,
          scrapeOptions: {
            formats: ["markdown"],
          },
        }) as unknown as { success: boolean; data: FirecrawlSearchResult[] };

        if (searchResult.success && searchResult.data) {
          for (const item of searchResult.data) {
            const itemUrl = (item as FirecrawlSearchResult).url ?? "";
            if (!itemUrl) continue;

            const prop = parsePropertyFromResult(item as FirecrawlSearchResult, {
              operationType: filters.operationType,
              propertyType: filters.propertyType,
              city: filters.city,
              neighborhood: filters.neighborhood ?? null,
            }, globalIndex++);

            allProperties.push(prop);
          }
        }
      } catch (portalErr) {
        console.warn(`Search failed for portal query: ${searchQuery}`, portalErr);
      }

      await new Promise((r) => setTimeout(r, 300));
    }

    const seen = new Set<string>();
    const unique = allProperties.filter((p) => {
      if (seen.has(p.sourceUrl)) return false;
      seen.add(p.sourceUrl);
      return true;
    });

    return res.json({
      properties: unique,
      total: unique.length,
      filters,
    });
  } catch (err) {
    console.error("Firecrawl search error:", err);
    return res.status(500).json({ error: "Erro ao buscar imóveis. Verifique sua chave Firecrawl." });
  }
});

export default router;
