## PetRescue Brasil — PRD (MVP)

### 1. Visão Geral
- **Nome do Produto:** PetRescue Brasil
- **Idiomas:** Português do Brasil (pt-BR)
- **Mercado-alvo:** Brasil
- **Missão:** Conectar animais resgatados a famílias amorosas por meio de uma plataforma gratuita e comunitária.

### 2. Objetivos do MVP
- Publicar animais para adoção com fotos e informações básicas.
- Descobrir animais por localização e características.
- Criar senso de urgência com contagem regressiva no anúncio (ex.: −30 dias desde a publicação) para aumentar conversões.
- Compartilhar anúncios nas redes sociais para estratégia viral.
- Proibir venda de animais e permitir denúncia de usuários e anúncios que tentem cobrar.

### 3. Regras de Negócio
- **Proibição de venda:** É estritamente proibido qualquer tipo de comercialização de animais. Anúncios e usuários que indicarem cobrança serão sinalizados para moderação.
- **Denúncias:** Qualquer usuário pode denunciar um anúncio/usuário por suspeita de venda, conteúdo impróprio ou fraude.
- **Urgência temporal:** Cada anúncio exibe uma contagem regressiva baseada na data de publicação (ex.: destaque de "oportunidade em destaque por 30 dias"). Após 30 dias, o anúncio permanece visível, mas perde destaque.

### 4. Funcionalidades do MVP
#### 4.1 Publicação de Animais
- Upload de múltiplas fotos.
- Informações: espécie, raça, idade, porte, sexo, saúde/vacinas, temperamento/necessidades, história do resgate e localização (cidade/bairro).
- Contato do responsável (email/telefone opcional) com proteção básica de privacidade.

#### 4.2 Descoberta e Busca
- Filtro por localização (cidade/UF) e características (espécie, idade, porte, sexo, necessidades especiais).
- Busca textual por palavras-chave.
- Ordenação por mais recentes e por destaque (dentro dos 30 dias).

#### 4.3 Urgência (Contagem Regressiva)
- Exibir timer de destaque até 30 dias a partir da publicação, mudando cores/estado conforme o tempo restante (ex.: verde >20 dias, amarelo 10–20, vermelho <10).

#### 4.4 Compartilhamento Social
- Botões de compartilhamento: WhatsApp, Instagram (link/cópia), Facebook, X (Twitter), copiar link.
- Metatags Open Graph e `og:image` para renderizar cards nas redes.

#### 4.5 Denúncias e Moderação
- Ação "Denunciar" no anúncio e no perfil do responsável.
- Categorias de denúncia: "Cobrando pela adoção", "Conteúdo impróprio", "Fraude/Spam".
- Fila simples de moderação para administradores.

#### 4.6 Usuários
- Cadastro/Login básico (email/senha) e perfis de responsáveis/adotantes.
- Verificação simples de contato (email) para reduzir abuso.

### 5. Métricas de Sucesso (MVP)
- Número de contatos iniciados por anúncio.
- Compartilhamentos por anúncio.
- Taxa de denúncias resolvidas e tempo de moderação.
- Adoções concluídas (self-report via botão "Adotado").

### 6. Arquitetura e Infra (aproveitando Medusa)
- **Backend:** Medusa v2 (Framework + módulos `@medusajs/user`, `@medusajs/store`, `@medusajs/notification`).
- **Dados de anúncio:** Usar módulo custom de "Listing" (pet) como entidade própria, ou mapear como `product` simplificado para MVP.
  - MVP mais rápido: usar `product` como "pet" + `product-variant` único e atributos em `metadata`.
  - Atributos recomendados em `metadata`: `species`, `breed`, `age`, `size`, `sex`, `health`, `temperament`, `special_needs`, `rescue_story`, `city`, `neighborhood`, `highlight_until` (data de publicação + 30 dias), `reported_count`.
- **Imagens:** Upload via API de mídia do storefront (Next.js) para storage (S3/Cloudflare R2) e salvar URLs no `product.images`.
- **Autenticação:** `@medusajs/auth` com email/senha.
- **Notificações:** `@medusajs/notification` opcional para emails de confirmação/alertas de moderação.
- **Storefront:** Next.js starter (existente) consumindo `@medusajs/js-sdk`.

### 7. Plano de Implementação Mínimo (passo a passo)
1) Modelagem rápida como Produto (MVP Express)
   - Criar categoria "Adoção" e tags para filtros (ex.: espécie/porte) ou usar `metadata` para todos atributos.
   - Ao criar um "pet", setar `metadata.highlight_until = published_at + 30d` e `metadata.reported_count = 0`.
   - Bloquear qualquer preço/checkout (ver seção de políticas) e esconder botões de compra; substituir por "Entrar em contato".

2) API de Denúncia
   - Endpoint POST `/store/pets/:id/report` (ou `/store/products/:id/report` no MVP), salva evento com `reason` e incrementa `reported_count`.
   - Endpoint GET `/admin/reports` para moderadores listarem denúncias.
   - Ação admin para marcar anúncio como "em revisão" e opcionalmente despublicar.

3) Política anti-venda (enforcement)
   - No backend: impedir criação de preço e checkout para produtos da categoria "Adoção".
   - No storefront: remover/ocultar componentes de carrinho/pagamento quando `product` pertencer à categoria "Adoção".
   - Texto legal e aviso no formulário e na página do anúncio.

4) Contagem regressiva e destaque
   - Cálculo client-side no storefront usando `metadata.highlight_until`.
   - Badges/cores conforme tempo restante; ordenar listagens por `published_at` e prioridade dentro da janela de 30 dias.

5) Compartilhamento Social
   - Adicionar botões (WhatsApp API com link + texto; compartilhamento Web Share API quando disponível).
   - Configurar metatags OG/Twitter no Next.js para páginas de detalhe do pet.

6) Formulário de Publicação
   - Página protegida para responsáveis criarem anúncio (upload de imagens + campos).
   - Chamar API do backend que cria `product` com `metadata` e imagens.

7) Moderação
   - Dashboard simples admin para ver denúncias, status e tomar ação (despublicar/banir).

8) Internacionalização e Conteúdo
   - UI em pt-BR; strings de alerta sobre proibição de venda.

### 8. Alterações no Código (alto nível)
- Backend (Medusa):
  - Rota Store: `POST /store/products/:id/report` (nova) — cria denúncia.
  - Middleware/validação: impedir preços/checkout para categoria "Adoção".
  - Rota Admin: `GET /admin/reports`, `POST /admin/reports/:id/action`.
- Storefront (Next.js):
  - Página de criação/edição de pet.
  - Banner/contador de destaque (30 dias) na página de detalhe.
  - Botões de compartilhamento e metatags OG.
  - Botão "Denunciar" com modal de motivo.
  - Remover compra/checkout para anúncios de adoção.

### 9. Segurança, Privacidade e Abusos
- Ocultar emails/telefones por padrão e exibir somente após ação explícita do usuário.
- Rate limiting de denúncias e publicação.
- Logs de auditoria para moderação.

### 10. Lançamento (Fases)
- **Fase 1 (MVP):** São Paulo, Rio de Janeiro, Belo Horizonte.
- **Fase 2:** Expansão para outras capitais e interior.
- **Fase 3:** Parcerias com ONGs, recursos avançados (mensageria in-app, verificação ampliada).

### 11. Dependências e Docs Medusa (referência)
- Framework e módulos: `@medusajs/framework`, `@medusajs/js-sdk`, `@medusajs/auth`, `@medusajs/notification`, `@medusajs/store`.
- Referências: docs de entidades `product`, `metadata`, rotas custom de Store/Admin, e políticas de pricing/cart para bloquear checkout.