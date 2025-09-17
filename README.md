# PetRescue Brasil — Marketplace de Adoção

Plataforma baseada no ecossistema Medusa para conectar protetores independentes e ONGs a adotantes em potencial. O projeto segue o recipe oficial de marketplace da Medusa, com adaptações para o contexto brasileiro de adoção responsável.

## Visão Geral
- **Back-end:** Medusa v2 com módulo `marketplace` personalizado (vínculo entre protetores, produtos/anúncios e denúncias).
- **Storefront:** Next.js 15 (app router) totalmente localizado em pt-BR, com destaque de urgência e botões de compartilhamento social.
- **Dashboard do protetor:** Aplicação React + Vite para gestão de anúncios, denúncias e perfis.
- **Banco de dados:** PostgreSQL 17 (Neon) com schema preparado para atributos dos animais e filtros por cidade/estado.

## Pré-requisitos
- Node.js 20+
- PostgreSQL 14+ (preferencialmente gerenciado)
- Redis (cache para sessões e filas)
- Yarn ou npm (monorepo utiliza ambos os lockfiles)

## Configuração do Back-end (Medusa)
1. Instale dependências:
   ```bash
   npm install
   ```
2. Configure variáveis de ambiente copiando o template:
   ```bash
   cp .env.template .env
   # edite o arquivo com os valores reais (ver seção de boas práticas)
   ```
3. Compile e aplique migrations:
   ```bash
   npm run build
   npx medusa db:migrate
   ```
4. (Opcional) Popular dados iniciais para o MVP PetRescue:
   ```bash
   npm run seed:petrescue
   ```
5. Inicie o servidor em modo desenvolvimento:
   ```bash
   npm run dev
   ```
   Para produção utilize `npm run start` após gerar build.

## Storefront (Next.js)
1. Entre na pasta e instale dependências:
   ```bash
   cd storefront
   npm install
   ```
2. Copie o template de variáveis e configure origens válidas e chaves externas (ex.: mapas, CDN de imagens):
   ```bash
   cp .env.template .env.local
   ```
3. Execute em desenvolvimento:
   ```bash
   npm run dev
   ```

## Dashboard do Protetor (Vite)
1. Instalação e execução:
   ```bash
   cd src/vendor-dashboard
   npm install
   npm run dev
   ```
2. A build de produção gera arquivos estáticos prontos para deploy em CDN:
   ```bash
   npm run build
   ```

## Scripts Úteis
- `npm run test:unit` – testes unitários.
- `npm run test:integration:http` – testa rotas HTTP críticas (denúncias, criação de anúncios, anti-checkout).
- `npm run seed` – seed genérico da Medusa.
- `npm run seed:petrescue` – seed com cidades brasileiras, categorias e exemplo de anúncio.

## Boas Práticas para Produção
- **Variáveis sensíveis:** `JWT_SECRET`, `COOKIE_SECRET` e `DATABASE_URL` devem usar valores fortes (>=32 caracteres) e nunca devem assumir o valor padrão `supersecret`. O `medusa-config.ts` bloqueia inicialização sem essas variáveis.
- **CORS restritivo:** Ajuste `STORE_CORS`, `ADMIN_CORS` e `AUTH_CORS` para os domínios oficiais (`https://app.petrescue.org.br`, por exemplo).
- **Banco de dados:** configure SSL obrigatório, backups diários e monitoramento de longas transações. Utilize migrations versionadas antes de qualquer deploy.
- **Cache/filas:** configure Redis gerenciado com senha forte e TLS.
- **Observabilidade:** habilite o arquivo `instrumentation.ts` conforme a [documentação oficial](https://docs.medusajs.com/learn/debugging-and-testing/instrumentation) e exporte métricas para Zipkin, OTLP ou o provedor da sua nuvem.
- **Política anti-venda:** middlewares `anti-sale` e `adoption-policy` bloqueiam criação de preços e checkout para anúncios de adoção. Mantenha testes cobrindo esses fluxos.
- **Segurança operacional:** habilite HTTPS em todos os serviços, configure rate limiting (via gateway/API) para criação de denúncias e logins, e monitore a fila de denúncias via dashboard admin.

### Checklist de prontidão para produção
1. **Variáveis no Railway:** defina `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `COOKIE_SECRET`, `STORE_CORS`, `ADMIN_CORS`, `AUTH_CORS`, `MEDUSA_BACKEND_URL`, `PORT=9000`, `MEDUSA_WORKER_MODE=server` e `MEDUSA_ADMIN_ONBOARDING_TYPE=default` antes do deploy.
2. **Instalação e build:** rode `npm install --omit=dev --legacy-peer-deps` seguido de `npm run build`.
3. **Migrations:** execute `npx medusa db:migrate` após cada alteração de schema.
4. **API Keys públicas:** crie uma chave publicável no Admin e injete seu valor em todas as chamadas públicas via header `x-publishable-api-key`.
5. **Smoke tests:** valide `GET /health`, `GET /` e os fluxos principais da API (`/store/products`, `/admin`) antes de liberar.

## Referências de Documentação Medusa
- [Framework Fundamentals](https://docs.medusajs.com/learn/fundamentals/framework)
- [Modules & Links](https://docs.medusajs.com/learn/fundamentals/modules)
- [API Routes Personalizadas](https://docs.medusajs.com/learn/fundamentals/api-routes)
- [Workflows para lógica avançada](https://docs.medusajs.com/learn/fundamentals/workflows)
- [Next.js Starter Storefront](https://docs.medusajs.com/nextjs-starter)

## Roadmap do MVP
Consulte `prd.md` e `DEV_ROADMAP.md` para visão completa de entregas, prioridades regionais (São Paulo, Rio de Janeiro, Belo Horizonte) e expansão futura.
