# Storefront PetRescue Brasil

Aplicação Next.js 15 que consome o back-end Medusa para listar animais resgatados, aplicar filtros por localização e destacar anúncios com contagem regressiva de 30 dias.

## Principais características
- App Router com componentes server/client otimizados para SEO.
- Internationalização fixa em pt-BR (HTML `lang="pt-BR"` e metadados traduzidos).
- Botões de compartilhamento social (WhatsApp, Instagram, Facebook e X).
- Bloqueio completo de carrinho/checkout para anúncios de adoção.
- Metatags Open Graph (`opengraph-image.jpg`, `twitter-image.jpg`) personalizadas para redes sociais.

## Pré-requisitos
- Node.js 20+
- Back-end Medusa rodando em `http://localhost:9000` (ajuste o `.env.local` conforme ambiente).

## Configuração
1. Instalar dependências:
   ```bash
   npm install
   ```
2. Criar arquivo de variáveis locais:
   ```bash
   cp .env.template .env.local
   ```
3. Ajustar variáveis principais:
   - `MEDUSA_BACKEND_URL` – URL do servidor Medusa utilizado pelo middleware.
   - `NEXT_PUBLIC_BASE_URL` – domínio público do storefront.
   - `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` – chave publicável associada ao sales channel ativo.
   - `REVALIDATE_SECRET` – segredo forte (>=32 caracteres) para revalidação on-demand.
4. Rodar em desenvolvimento:
   ```bash
   npm run dev
   ```
5. Gerar build de produção:
   ```bash
   npm run build
   npm run start
   ```

## Testes e qualidade
- `npm run lint` (quando configurado) para garantir padrões de código.
- `npm run test` pode ser habilitado conforme ampliarmos cobertura de componentes.
- Utilize `next-sitemap.js` para publicar o sitemap após cada deploy.

## Deploy recomendado
- Vercel, Netlify ou qualquer provedor com suporte a Next.js 15.
- Configure variáveis de ambiente seguras na plataforma escolhida.
- Ative logs estruturados e monitoramento (ex.: Vercel Analytics) para acompanhar métricas de adoção.

## Links úteis
- [Documentação Medusa Storefront](https://docs.medusajs.com/storefront-development)
- [Guia do Next.js App Router](https://nextjs.org/docs/app)
- [Boas práticas de SEO para e-commerce](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)

Com o storefront publicado e o backend Medusa configurado, o PetRescue Brasil fica pronto para receber anúncios e ajudar animais a encontrarem novos lares.
