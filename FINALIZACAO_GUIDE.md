# Guia de Finalização para Deploy em Produção

Este documento consolida os passos finais recomendados antes de liberar o PetRescue Brasil para produção. Utilize-o como checklist de verificação e referência rápida.

## 1. Infraestrutura e Configuração
- **Secrets obrigatórios:** defina `JWT_SECRET`, `COOKIE_SECRET` e `REVALIDATE_SECRET` com pelo menos 32 caracteres aleatórios.
- **CORS restritivo:** limite `STORE_CORS`, `ADMIN_CORS` e `AUTH_CORS` aos domínios oficiais (ex.: `https://app.petrescue.org.br`).
- **Banco de dados:** configure SSL obrigatório, monitoramento de conexões e backups automáticos diários. Garanta migrations sincronizadas (`npx medusa db:migrate`).
- **Redis:** habilite TLS e autenticação forte. Configure políticas de expiração adequadas para sessões e filas.
- **Observabilidade:** ative `instrumentation.ts` apontando para Zipkin/OTLP ou serviço equivalente; valide dashboards e alertas críticos.

## 2. Segurança e Compliance
- **Política anti-venda:** revise testes dos middlewares `anti-sale` e `adoption-policy`; execute `npm run test:integration:http`.
- **Rate limiting:** aplicar limites na API de denúncias (`/store/products/:id/report`) e autenticação de protetores via gateway/API manager.
- **Auditoria:** habilitar logs estruturados (JSON) para rotas sensíveis e armazenar em solução centralizada (Datadog, ELK, etc.).
- **LGPD:** confirmar consentimento explícito para armazenamento de dados pessoais e disponibilizar política de privacidade atualizada no storefront.

## 3. Qualidade e Homologação
- **Revisão de UI:** validar copy pt-BR, responsividade e fluxo de contato sem checkout monetário.
- **Acessibilidade:** rodar `npm run lint` no storefront e validar contrastes nos componentes principais.
- **Fluxos críticos:** executar smoke test manual: criação de anúncio, denúncia, login protetor, contato via storefront.
- **Dados reais:** cadastrar pelo menos 3 anúncios piloto (cães/gatos) com imagens otimizadas antes do go-live.

## 4. Deploy e Pós-Go-Live
- **Storefront:** preferencialmente deploy em Vercel com variáveis de ambiente seguras e monitoramento ativo.
- **Backend (Medusa):** deploy em ambiente gerenciado (Railway, Fly.io ou VPS) com PM2/forever e health-check configurado.
- **Dashboard do protetor:** publicar build estática em CDN (Netlify, Cloudflare Pages) apontando para backend em HTTPS.
- **Suporte:** preparar canal de atendimento (email ou form) para denúncias urgentes pós-lançamento.
- **Métricas:** configurar tracking das métricas do PRD (contatos iniciados, compartilhamentos, denúncias resolvidas, adoções concluídas).

## 5. Próximos Incrementos (Opcional)
- Integração com provedores de armazenamento de imagens (S3/R2) via CDN.
- Implementação de moderação assistida com fila e notificações por email.
- Migração para sistema de mensagens interno entre adotantes e protetores.
- Verificação de identidade de protetores (documentos + selfie) para V2.

## 6. Passo a Passo para Conclusão Imediata
1. **Revisar fluxos anti-venda**
   - Rodar `npm run test:integration:http` e garantir que os middlewares `anti-sale`/`adoption-policy` bloqueiem qualquer tentativa de checkout.
   - Navegar no storefront e confirmar que todas as chamadas à ação direcionam para contato com o protetor (sem compra).
2. **Ajustar comunicação e patrocínios**
   - Revisar textos das páginas principais para enfatizar adoção gratuita e missão social.
   - Inserir placeholders ou componentes para patrocínios/anúncios (sem monetização direta de animais).
3. **Validar operações do protetor**
   - Corrigir o endpoint `src/api/vendor/orders/route.ts` para filtrar solicitações por protetor.
   - Testar criação/edição de anúncios e recebimento de denúncias pelo painel.
4. **Configurar ambientes e executar migrations**
   - Definir secrets fortes (`JWT_SECRET`, `COOKIE_SECRET`, `REVALIDATE_SECRET`, CORS e `DATABASE_URL`).
   - Executar `npm run build` e `npx medusa db:migrate` no backend.
5. **QA final e smoke test**
   - Cadastrar 3 anúncios piloto com imagens otimizadas.
   - Realizar fluxo completo: visitante entra no site, consulta anúncio, envia denúncia, protetor responde pelo dashboard.
   - Verificar responsividade, acessibilidade e copy pt-BR.
6. **Configurar observabilidade e suporte**
   - Ativar `instrumentation.ts` apontando para o serviço de tracing/monitoramento.
   - Definir canal de suporte para denúncias urgentes e alinhar coleta de métricas (contatos, adoções, compartilhamentos).

> **Checklist final:** todos os itens acima devem estar marcados antes de anunciar o MVP para o público. Atualize este arquivo com observações quando o processo avançar.
