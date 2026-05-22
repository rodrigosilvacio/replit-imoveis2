# Busca Inteligente de Imóveis

Uma aplicação web que permite buscar imóveis para venda ou locação em grandes portais brasileiros (ZAP Imóveis, Viva Real, OLX, ImovelWeb), com interpretação de preferências em linguagem natural via OpenAI e coleta de dados via Firecrawl.

## Run & Operate

- `pnpm --filter @workspace/busca-imoveis run dev` — frontend React/Vite (porta $PORT)
- `pnpm --filter @workspace/api-server run dev` — API Express (porta $PORT)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerar hooks React Query e schemas Zod a partir da spec OpenAPI
- Required env: `OPENAI_API_KEY`, `FIRECRAWL_API_KEY`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 18 + Vite + TailwindCSS + shadcn/ui + react-hook-form + zod + wouter
- API: Express 5
- AI: OpenAI gpt-4o-mini (interpretação de texto livre em filtros estruturados)
- Busca: Firecrawl (search de imóveis nos portais, respeitando termos de uso)
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — spec OpenAPI, fonte da verdade para todos os contratos de API
- `artifacts/api-server/src/routes/search.ts` — rotas de busca (/search/parse e /search/properties)
- `artifacts/busca-imoveis/src/components/search-form.tsx` — formulário de busca com todos os filtros
- `artifacts/busca-imoveis/src/components/property-card.tsx` — card de imóvel com todos os campos
- `artifacts/busca-imoveis/src/pages/search.tsx` — tela inicial com hero e formulário
- `artifacts/busca-imoveis/src/pages/results.tsx` — grade de resultados com loading/empty states
- `artifacts/busca-imoveis/src/lib/store.tsx` — estado global (filtros, resultados, loading)

## Architecture decisions

- Firecrawl é usado para fazer search nos portais via Google (site:zapimoveis.com.br ...) — evita scraping direto e respeita termos de uso
- OpenAI gpt-4o-mini interpreta texto livre e retorna JSON estruturado; filtros do formulário têm prioridade se conflitarem
- O fluxo de busca é sequencial: parse (se há texto livre) → search properties
- A spec OpenAPI define ParsePreferencesInput (entrada do parse) separada de SearchFilters (saída do parse = entrada da busca) para evitar colisões de nomes no Orval codegen
- Estado global com React Context preserva filtros e resultados ao navegar entre telas

## Product

- Tela inicial com formulário completo: tipo de operação, tipo de imóvel, cidade, bairro, faixas de valor, quartos, banheiros, vagas, área mínima e texto livre
- Campo de texto livre interpretado por IA para enriquecer os filtros estruturados
- Busca simultânea em ZAP Imóveis, Viva Real, OLX e ImovelWeb via Firecrawl
- Cards de resultado com: imagem, valor, tipo, cidade/bairro, área m², quartos, banheiros, vagas, portal de origem, link direto ao anúncio
- Estados de loading com mensagem descritiva, empty state e error state

## User preferences

- Aplicação em português (Brasil)
- Firecrawl no lugar de SerpAPI para busca nos portais

## Gotchas

- A API do Firecrawl tem limite de buscas no plano gratuito (500 créditos/mês) — cada busca consome 4 créditos (um por portal)
- Após alterações na spec OpenAPI, sempre rodar codegen antes de usar os tipos gerados
- SelectItem do shadcn/ui não aceita value="" — usar "any" como valor representando "Qualquer"
