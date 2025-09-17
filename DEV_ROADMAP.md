# PetRescue Brasil - Development Roadmap
## Medusa Marketplace Implementation Plan

### Overview
Transform existing medusa-marketplace into PetRescue Brasil - a pet adoption platform for the Brazilian market, following Medusa marketplace recipe patterns.

**Target:** Minimum Viable Product (MVP) for São Paulo, Rio de Janeiro, Belo Horizonte
**Language:** Portuguese (pt-BR) only
**Timeline:** 3-4 weeks development
**Architecture:** Medusa v2 + Next.js Storefront

---

## 🗄️ **DATABASE SETUP COMPLETED** ✅

### **MCP Database Infrastructure**
**Status:** ✅ **COMPLETED** - Database fully configured and seeded

**Database Details:**
- **Project**: `dry-feather-30036892` (neon-blue-elephant)
- **Branch**: `br-calm-dew-acardhs8` (development)
- **Database**: `petrescue_brasil`
- **Region**: `sa-east-1` (Brazil)
- **PostgreSQL Version**: 17.5

**Connection Details:**
```
Host: ep-withered-truth-acc5og4q-pooler.sa-east-1.aws.neon.tech
Database: petrescue_brasil
Username: neondb_owner
Password: npg_zpjwXBPl96Si
Port: 5432
SSL: Required
```

### **Schema Created (7 Tables)**
1. **`cities`** - Brazilian cities data (São Paulo, Rio de Janeiro, Belo Horizonte)
2. **`product_categories`** - Medusa-compatible categories (Adoção, Cães, Gatos, Outros)
3. **`products`** - Pet listings (Medusa-compatible with metadata)
4. **`product_category_product`** - Category relationships
5. **`locale_settings`** - Portuguese (pt-BR) configuration
6. **`migration_tracking`** - Version control for schema changes
7. **`pet_metadata`** - Extended pet information

### **Data Seeded**
- ✅ **3 Brazilian Cities**: São Paulo, Rio de Janeiro, Belo Horizonte
- ✅ **4 Product Categories**: Adoção, Cães, Gatos, Outros
- ✅ **Portuguese Locale**: pt-BR with BRL currency
- ✅ **Migration Tracking**: Version 1.0.0 recorded

---

## 🔧 **MCP DATABASE ACCESS & TOOLS**

### **How to Access Database via MCP**

#### **1. Neon MCP Tools Available**
```bash
# List all available Neon tools
mcp_rube_RUBE_SEARCH_TOOLS --toolkits=["neon"]

# Key tools for database management:
- NEON_RETRIEVE_PROJECTS_LIST
- NEON_GET_PROJECT_BRANCHES  
- NEON_GET_SCHEMA_FOR_PROJECT_BRANCH
- NEON_CREATE_BRANCH_DATABASE
- NEON_GET_PROJECT_CONNECTION_URI
- NEON_REVEAL_ROLE_PASSWORD_IN_BRANCH
```

#### **2. Database Connection via MCP**
```python
# Use MCP Remote Workbench for SQL execution
mcp_rube_RUBE_REMOTE_WORKBENCH

# Example connection code:
import psycopg2
CONN_STRING = "postgresql://neondb_owner:npg_zpjwXBPl96Si@ep-withered-truth-acc5og4q-pooler.sa-east-1.aws.neon.tech:5432/petrescue_brasil?sslmode=require"
conn = psycopg2.connect(CONN_STRING)
```

#### **3. Common Database Operations**
```python
# Check database status
cursor.execute("SELECT COUNT(*) FROM cities;")
cursor.execute("SELECT COUNT(*) FROM product_categories;")

# Add new cities
INSERT INTO cities (name, state, country) VALUES ('Salvador', 'BA', 'BR');

# Add new product categories  
INSERT INTO product_categories (name, description, handle) VALUES ('Aves', 'Pássaros para adoção', 'aves');

# Query pets with metadata
SELECT * FROM products WHERE metadata->>'adoption' = 'true';
```

### **MCP Workflow for Database Changes**
1. **Plan Changes**: Use `RUBE_CREATE_PLAN` for database modifications
2. **Execute SQL**: Use `RUBE_REMOTE_WORKBENCH` for script execution
3. **Validate**: Use `RUBE_MULTI_EXECUTE_TOOL` for verification
4. **Track**: Update `migration_tracking` table

---

## 🏗️ Technical Architecture (Medusa Recipe Compliance)

### Core Medusa Patterns Applied
```
┌─ Custom Marketplace Module ✅ (Already implemented)
├─ Product-as-Pet Mapping ✅ (Basic structure exists)  
├─ Module Links ✅ (vendor-product relationship)
├─ Custom API Routes 🔄 (Partially implemented)
├─ Actor Types ❌ (Need pet adopter/rescuer actors)
└─ Custom Workflows ❌ (Need adoption workflows)
```

### Data Model Strategy
**Following Medusa Recipe:** Use existing Product entity as "Pet" + Custom Marketplace Module for reports/moderation

```typescript
// Pet = Product with specialized metadata
Product {
  category: "Adoção" 
  metadata: {
    adoption: true,
    species, breed, age, size, sex,
    health, temperament, special_needs,
    rescue_story, city, neighborhood,
    highlight_until: Date, // 30-day urgency
    reported_count: number,
    contact_email, contact_phone
  }
}

// Existing Marketplace Module
Marketplace {
  Vendor,      // Pet rescue organizations
  VendorAdmin, // Rescue admins
  Report       // Abuse reports ✅ Implemented
}
```

---

## 🎯 MINIMAL VIABLE PRODUCT (MVP) SCOPE

### Core Features (Must Have)
1. **Pet Listing Creation** - Rescuers can post pets
2. **Pet Discovery** - Users can browse/search pets
3. **Location-based Search** - Find pets by Brazilian cities
4. **Urgency System** - 30-day countdown for adoption urgency
5. **Anti-Sale Enforcement** - Block any payment/pricing
6. **Report System** - Flag inappropriate content
7. **Portuguese Localization** - Complete pt-BR interface

### Excluded from MVP (Post-Launch)
- User profiles/accounts (use guest posting initially)
- Advanced admin dashboard
- Email notifications
- Image upload (use URL initially)
- Social login
- Mobile app

---

## 📋 DEVELOPMENT PHASES

## **PHASE 1: CORE PLATFORM (Week 1)** ✅ **COMPLETED**
*Priority: Critical - Foundation for all features*

### 1.1 Database Setup & Category System ✅ **COMPLETED**
**Status:** ✅ **COMPLETED** - Database fully configured and seeded

**Completed Tasks:**
- ✅ Created `petrescue_brasil` database in Neon
- ✅ Seeded "Adoção" product category and subcategories
- ✅ Configured pt-BR locale support
- ✅ Added Brazilian cities reference data (São Paulo, Rio de Janeiro, Belo Horizonte)
- ✅ Created Medusa-compatible schema with 7 tables
- ✅ Implemented migration tracking system

**Database Connection:**
```bash
# Use MCP tools to access:
mcp_rube_RUBE_REMOTE_WORKBENCH
# Connection string provided above
```

### 1.2 Anti-Sale Enforcement (Medusa Recipe: Custom Middleware)
**Files:** 
- `src/api/middlewares/anti-sale.ts` *(New)*
- `src/api/store/carts/*/route.ts` *(Modify)*

```typescript
// Implementation Pattern:
- Block cart/checkout for category "Adoção"
- Middleware to prevent pricing on adoption products
- API guards to reject payment operations
- Storefront cart button hiding
```

### 1.3 Enhanced Pet Creation API (Medusa Recipe: Custom Store Routes)
**Files:** 
- `src/api/store/products/route.ts` *(Enhance existing)*

```typescript
// Current: Basic product creation
// Target: Full pet metadata validation
- Add all 15+ pet-specific fields
- Brazilian location validation
- Image URL validation
- Contact privacy handling
```

**Estimated Time:** 3-4 days
**Success Criteria:** 
- ✅ Pets can be created with full metadata
- ✅ No payment/pricing possible for adoption category
- ✅ Brazilian location data properly stored

---

## **PHASE 2: PET DISCOVERY (Week 2)**
*Priority: High - Core user experience*

### 2.1 Pet Listing Pages (Medusa Recipe: Custom Storefront)
**Files:** 
- `storefront/src/app/[countryCode]/(main)/pets/page.tsx` *(New)*
- `storefront/src/app/[countryCode]/(main)/pets/[id]/page.tsx` *(New)*
- `storefront/src/modules/pets/components/pet-card.tsx` *(New)*
- `storefront/src/modules/pets/components/pet-detail.tsx` *(New)*

```tsx
// Pet Listing Features:
- Grid layout with pet cards
- Urgency countdown badges
- Location and basic info display
- "Entrar em contato" buttons (no purchase)
```

### 2.2 Search & Filter System
**Files:**
- `storefront/src/modules/pets/components/pet-filters.tsx` *(New)*
- `src/api/store/pets/search/route.ts` *(New)*

```typescript
// Search Parameters:
- Location: city, state (Brazilian specific)
- Species: cão, gato, outros
- Age: filhote, jovem, adulto, idoso
- Size: pequeno, médio, grande
- Sex: macho, fêmea
- Special needs: boolean
- Keyword search: title/description
```

### 2.3 Enhanced Pet Form (Complete Implementation)
**Files:**
- `storefront/src/modules/pets/components/new-pet-form.tsx` *(Enhance existing)*

```tsx
// Current: 3 fields (title, description, imageUrl)
// Target: 15+ fields with proper validation
- Species dropdown
- Brazilian city/state selectors  
- Age categories
- Health status checkboxes
- Contact privacy options
```

**Estimated Time:** 5-6 days
**Success Criteria:**
- ✅ Users can browse pets in grid layout
- ✅ Location-based search works for Brazilian cities
- ✅ Complete pet information displayed
- ✅ Mobile-responsive design

---

## **PHASE 3: URGENCY & SHARING (Week 3)**
*Priority: High - Conversion features*

### 3.1 Urgency Countdown System
**Files:**
- `storefront/src/modules/pets/components/urgency-badge.tsx` *(New)*
- `storefront/src/lib/urgency-calculator.ts` *(New)*

```tsx
// Urgency Logic (based on metadata.highlight_until):
- Verde (>20 days): "Novo pet para adoção!"
- Amarelo (10-20 days): "Oportunidade de adoção!"  
- Vermelho (<10 days): "Urgente - Precisa de um lar!"
- Expired (>30 days): Still visible, no urgency badge
```

### 3.2 Social Sharing System
**Files:**
- `storefront/src/modules/pets/components/social-share.tsx` *(New)*
- `storefront/src/app/[countryCode]/(main)/pets/[id]/opengraph-image.tsx` *(New)*

```tsx
// Sharing Options:
- WhatsApp: Text + link
- Instagram: Copy link + message
- Facebook: Open Graph integration
- X/Twitter: Text + hashtags
- Copy link functionality
```

### 3.3 Portuguese Localization (Complete)
**Files:**
- `storefront/src/lib/locales/pt-br.json` *(New)*
- All component files *(Modify for i18n)*

```json
// Key translations:
- All UI text in Portuguese
- Error messages in Portuguese  
- Brazilian date/time formatting
- Currency formatting (BRL)
- Phone/address formatting
```

**Estimated Time:** 4-5 days
**Success Criteria:**
- ✅ Urgency system increases adoption urgency
- ✅ Social sharing generates traffic
- ✅ Complete Portuguese interface
- ✅ Brazilian formatting standards

---

## **PHASE 4: SAFETY & MODERATION (Week 4)**
*Priority: Medium - Platform safety*

### 4.1 Report System Enhancement (Medusa Recipe: Custom Workflows)
**Files:**
- `storefront/src/modules/pets/components/report-modal.tsx` *(New)*
- `src/workflows/process-report.ts` *(New)*
- `src/api/admin/reports/[id]/actions/route.ts` *(Enhance)*

```tsx
// Report Categories (pt-BR):
- "Cobrando pela adoção" 
- "Conteúdo impróprio"
- "Fraude ou spam"
- "Informações falsas"
```

### 4.2 Contact Privacy Protection
**Files:**
- `storefront/src/modules/pets/components/contact-reveal.tsx` *(New)*
- `src/api/store/pets/[id]/reveal-contact/route.ts` *(New)*

```typescript
// Privacy Features:
- Hide email/phone by default
- "Mostrar contato" button with click tracking
- Rate limiting per IP/session
- Basic email format validation
```

### 4.3 Basic Admin Moderation (Medusa Recipe: Custom Admin Routes)
**Files:**
- `src/admin/widgets/report-queue.tsx` *(New)*
- `src/api/admin/moderation/*/route.ts` *(New)*

```tsx
// Admin Features:
- Report queue dashboard
- One-click approve/reject
- Bulk actions for reports
- Simple pet status management
```

**Estimated Time:** 3-4 days
**Success Criteria:**
- ✅ Users can report inappropriate content
- ✅ Contact information properly protected
- ✅ Basic admin moderation functional

---

## 🔧 TECHNICAL IMPLEMENTATION DETAILS

### Medusa Recipe Compliance Checklist

#### ✅ **Custom Module with Data Models**
```typescript
// Already implemented:
src/modules/marketplace/
├── models/vendor.ts
├── models/vendor-admin.ts  
├── models/report.ts
└── services/vendor.ts
```

#### ✅ **Module Links**
```typescript
// Already implemented:
src/links/vendor-product-link.ts
// Links vendors to their products (pets)
```

#### 🔄 **Custom API Routes** (Partially Done)
```typescript
// Existing:
- POST /store/products (pet creation)
- POST /store/products/[id]/report  
- GET /admin/reports

// Need to add:
- GET /store/pets/search
- POST /store/pets/[id]/reveal-contact
- POST /admin/reports/[id]/actions
```

#### ❌ **Actor Types** (Need Implementation)
```typescript
// Required for pet adoption actors:
src/auth/actors/
├── adopter.ts     // Users looking to adopt
├── rescuer.ts     // Users posting pets
└── moderator.ts   // Admin users
```

#### ❌ **Workflows** (Need Implementation)
```typescript
// Required workflows:
src/workflows/
├── process-pet-report.ts
├── moderate-content.ts
└── track-adoption.ts
```

### Database Schema Enhancements
```sql
-- Additional indexes for performance:
CREATE INDEX idx_products_adoption ON products USING GIN ((metadata->'adoption'));
CREATE INDEX idx_products_city ON products USING GIN ((metadata->'city'));
CREATE INDEX idx_products_species ON products USING GIN ((metadata->'species'));
CREATE INDEX idx_products_highlight_until ON products USING BTREE ((metadata->>'highlight_until'));
```

### API Endpoints Summary
```typescript
// Store API (Public)
GET    /store/pets              // List pets with filters
GET    /store/pets/[id]         // Get pet details  
POST   /store/pets              // Create pet (rescuer)
POST   /store/pets/[id]/report  // Report pet/user ✅
POST   /store/pets/[id]/contact // Reveal contact info

// Admin API (Protected)  
GET    /admin/reports           // List reports ✅
POST   /admin/reports/[id]/action // Moderate report ✅
GET    /admin/pets              // Manage all pets
POST   /admin/pets/[id]/status  // Update pet status
```

---

## 📱 RESPONSIVE DESIGN REQUIREMENTS

### Mobile-First Approach (80% Brazilian mobile usage)
```scss
// Breakpoints:
- Mobile: 320px - 768px (Primary)
- Tablet: 768px - 1024px  
- Desktop: 1024px+ (Secondary)

// Key mobile features:
- Touch-friendly buttons (min 44px)
- Swipe gestures for image galleries
- Fast loading (<3s on 3G)
- Offline-first caching strategy
```

### Performance Targets
```typescript
// Core Web Vitals:
- Largest Contentful Paint: <2.5s
- First Input Delay: <100ms  
- Cumulative Layout Shift: <0.1

// Brazilian Network Conditions:
- Test on 3G networks
- Image optimization critical
- CDN for static assets
```

---

## 🔒 SECURITY & COMPLIANCE

### LGPD (Lei Geral de Proteção de Dados) Compliance
```typescript
// Privacy Requirements:
- Explicit consent for contact info sharing
- Right to data deletion
- Contact masking by default
- Secure contact revelation tracking
```

### Rate Limiting Strategy  
```typescript
// API Rate Limits:
- Pet creation: 5 per hour per IP
- Contact reveals: 10 per day per IP  
- Reports: 20 per day per IP
- Search: 100 per minute per IP
```

### Content Moderation
```typescript
// Auto-flagging triggers:
- Keywords related to selling/pricing
- Multiple reports on same content
- Suspicious contact patterns
- Fake/spam content detection
```

---

## 🚀 DEPLOYMENT & LAUNCH PLAN

### Environment Setup
```bash
# Development
- Local: Docker Compose ✅
- Database: PostgreSQL with pt-BR collation
- File Storage: Local/Cloudflare R2
- Search: Basic SQL (upgrade to Algolia later)

# Production  
- Platform: Vercel (Frontend) + Railway/DigitalOcean (Backend)
- Database: Managed PostgreSQL
- CDN: Cloudflare (Brazilian edge locations)
- Monitoring: Sentry + Vercel Analytics
```

### Launch Strategy
```typescript
// Phase 1: Soft Launch (Week 5)
- São Paulo only
- Limited beta users (50-100)
- Monitor performance/bugs
- Gather user feedback

// Phase 2: Regional Launch (Week 6-8)  
- Add Rio de Janeiro, Belo Horizonte
- Scale infrastructure
- Add customer support
- SEO optimization

// Phase 3: National (Month 3+)
- All major Brazilian cities
- Partner with rescue organizations
- Advanced features (notifications, profiles)
```

---

## 📊 SUCCESS METRICS & KPIs

### MVP Success Criteria
```typescript
// User Engagement:
- 100+ pets listed in first month
- 50+ contact reveals per week
- <5% report rate (indicates quality content)
- 60%+ mobile traffic share

// Technical Performance:
- 99.5% uptime
- <3s page load time  
- <10% bounce rate on pet detail pages
- Zero payment/checkout incidents
```

### Business Metrics
```typescript
// Adoption Funnel:
- Pet views → Contact reveals → Adoptions
- Target: 5% conversion from view to contact
- Target: 20% conversion from contact to adoption
- Monthly goal: 20+ successful adoptions
```

---

## 🔄 POST-MVP ROADMAP (Months 2-6)

### Advanced Features
1. **User Accounts & Profiles** - Adopter/rescuer accounts
2. **In-App Messaging** - Secure communication system
3. **Advanced Search** - AI-powered pet matching
4. **Mobile App** - React Native application
5. **Organization Partnerships** - Verified rescue groups
6. **Success Stories** - Adoption showcase
7. **Event Management** - Adoption events/fairs

### Technical Enhancements  
1. **Elasticsearch** - Advanced search capabilities
2. **Real-time Notifications** - WebSocket integration
3. **Image Recognition** - Auto-tag pet characteristics
4. **Analytics Dashboard** - Business intelligence
5. **API Marketplace** - Third-party integrations

---

## ✅ IMPLEMENTATION CHECKLIST

### Pre-Development
- [x] Environment setup verified
- [x] Database migrations tested
- [x] Brazilian locale data prepared
- [x] Design system components ready

### Phase 1 (Week 1) ✅ **COMPLETED**
- [x] Database setup and seeding completed
- [x] Anti-sale enforcement implemented
- [x] Enhanced pet creation API
- [x] Database seeded with categories
- [x] Basic admin protection

### Phase 2 (Week 2)  
- [ ] Pet listing pages functional
- [ ] Search/filter system working
- [ ] Location-based queries optimized
- [ ] Mobile responsive design

### Phase 3 (Week 3)
- [ ] Urgency countdown system
- [ ] Social sharing with Open Graph
- [ ] Complete Portuguese localization
- [ ] Brazilian formatting standards

### Phase 4 (Week 4)
- [ ] Enhanced report system
- [ ] Contact privacy protection  
- [ ] Basic admin moderation
- [ ] Security measures active

### Pre-Launch (Week 5)
- [ ] End-to-end testing complete
- [ ] Performance optimization done
- [ ] Security audit passed
- [ ] Content moderation active
- [ ] Analytics tracking setup
- [ ] Legal compliance verified

---

**Total Estimated Development Time:** 3-4 weeks
**Team Size:** 2-3 developers
**Launch Target:** São Paulo market
**Success Definition:** 100+ pets listed, 20+ adoptions in first month

This roadmap ensures full compliance with Medusa marketplace recipe patterns while delivering a focused, market-ready pet adoption platform for Brazil.

---

## 🔧 **MCP DATABASE MANAGEMENT GUIDE**

### **Quick Access Commands**
```bash
# Check database status
mcp_rube_RUBE_REMOTE_WORKBENCH
# Then run: cursor.execute("SELECT COUNT(*) FROM cities;")

# Add new city
INSERT INTO cities (name, state, country) VALUES ('Salvador', 'BA', 'BR');

# Add new category
INSERT INTO product_categories (name, description, handle) VALUES ('Aves', 'Pássaros para adoção', 'aves');

# Check migration status
SELECT * FROM migration_tracking ORDER BY created_at DESC;
```

### **Database Backup & Recovery**
```bash
# Create backup via MCP
mcp_rube_RUBE_REMOTE_WORKBENCH
# Export data to JSON files

# Restore from backup
# Use MCP to execute restore scripts
```

### **Performance Monitoring**
```bash
# Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size FROM pg_tables WHERE schemaname = 'public';

# Check indexes
SELECT indexname, indexdef FROM pg_indexes WHERE schemaname = 'public';
```

### **MCP Tool Reference**
```bash
# Search for available tools
mcp_rube_RUBE_SEARCH_TOOLS --toolkits=["neon"]

# Execute multiple tools in parallel
mcp_rube_RUBE_MULTI_EXECUTE_TOOL

# Run SQL scripts in remote workbench
mcp_rube_RUBE_REMOTE_WORKBENCH

# Create execution plans
mcp_rube_RUBE_CREATE_PLAN
```

**Database Status:** ✅ **READY FOR DEVELOPMENT** - All Phase 1 database requirements completed via MCP tools.
