# Busca Inteligente de Imóveis

Aplicação web para busca de imóveis à venda ou para locação nos principais portais brasileiros (ZAP Imóveis, Viva Real, OLX, ImovelWeb). A aplicação interpreta preferências em linguagem natural usando OpenAI e realiza a coleta de dados via Firecrawl.

## Funcionalidades

- **Busca multi-portal**: pesquisa simultânea em ZAP Imóveis, Viva Real, OLX e ImovelWeb
- **Interpretação de linguagem natural**: campo de texto livre processado por IA (OpenAI gpt-4o-mini) para extrair filtros estruturados
- **Filtros completos**: tipo de operação (venda/locação), tipo de imóvel, cidade, bairro, faixa de preço, quartos, banheiros, vagas e área mínima
- **Cards de resultados**: exibição com imagem, valor, características do imóvel, portal de origem e link direto ao anúncio
- **Estados visuais**: loading com mensagem descritiva, empty state e error state

## Stack Tecnológica

- **Monorepo**: pnpm workspaces
- **Linguagem**: TypeScript 5.9, Node.js
- **Frontend**: React 19 + Vite + TailwindCSS + shadcn/ui + React Hook Form + Zod + Wouter
- **Backend**: Express 5
- **IA**: OpenAI (gpt-4o-mini)
- **Busca**: Firecrawl (pesquisa nos portais via Google)
- **Banco de dados**: PostgreSQL com Drizzle ORM
- **Code generation**: Orval (geração de hooks React Query e schemas Zod a partir da spec OpenAPI)
- **Build**: esbuild

## Instalação

1. Clone o repositório
2. Instale as dependências com pnpm:

```bash
pnpm install
```

## Configuração

Configure as seguintes variáveis de ambiente:

- `OPENAI_API_KEY` — chave da API OpenAI
- `FIRECRAWL_API_KEY` — chave da API Firecrawl
- `DATABASE_URL` — URL de conexão PostgreSQL (necessária para o módulo db)

## Execução

### Servidor de desenvolvimento (frontend)

```bash
pnpm --filter @workspace/busca-imoveis run dev
```

### Servidor de API

```bash
pnpm --filter @workspace/api-server run dev
```

### Typecheck completo

```bash
pnpm run typecheck
```

### Build de todos os pacotes

```bash
pnpm run build
```

### Regenerar código a partir da spec OpenAPI

```bash
pnpm --filter @workspace/api-spec run codegen
```

## Estrutura de Pastas

```
/
├── artifacts/
│   ├── api-server/          # Servidor Express com rotas de busca
│   ├── busca-imoveis/       # Frontend React (Vite)
│   └── mockup-sandbox/      # Sandbox para mockups
├── lib/
│   ├── api-client-react/    # Cliente de API com React Query
│   ├── api-spec/            # Especificação OpenAPI e configuração Orval
│   ├── api-zod/             # Schemas Zod gerados
│   └── db/                  # Configuração Drizzle ORM e schemas do banco
├── scripts/                 # Scripts utilitários
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── tsconfig.json
```

## Variáveis de Ambiente

| Variável | Descrição |
|----------|-----------|
| `OPENAI_API_KEY` | Chave da API OpenAI |
| `FIRECRAWL_API_KEY` | Chave da API Firecrawl |
| `DATABASE_URL` | URL de conexão PostgreSQL |

## Licença

MIT
