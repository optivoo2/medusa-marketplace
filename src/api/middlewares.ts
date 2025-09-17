import { defineMiddlewares } from "@medusajs/framework/http"
import type { MedusaRequest, MedusaResponse, MedusaNextFunction } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { antiSaleMiddleware } from "./middlewares/anti-sale"
import { preventAdoptionProductPurchase, preventAdoptionProductPricing } from "./middlewares/adoption-policy"

async function blockAdoptionCheckout(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  try {
    // Intercept cart completion to prevent checkout when adoption listings are present
    const isCompleteCart = req.method === "POST" && /\/store\/carts\/.+\/complete$/.test(req.originalUrl || req.url)

    if (!isCompleteCart) {
      return next()
    }

    const cartModule = req.scope.resolve(Modules.CART)

    if (isCompleteCart) {
      const cartId = req.params.id
      if (!cartId) return next()
      const [cart] = await cartModule.listCarts({ id: [cartId] }, { relations: ["items", "items.product"] })
      const hasAdoption = cart?.items?.some((li: any) => {
        const p = li.product
        return p?.categories?.some((c: any) => c.handle === "adocao" || c.handle === "adoption") || (p?.metadata as any)?.adoption === true
      })
      if (hasAdoption) {
        return res.status(400).json({ error: "Carrinho contém anúncio de adoção. Remova-o para prosseguir." })
      }
      return next()
    }

    next()
  } catch {
    next()
  }
}

export default defineMiddlewares({
  routes: [
    // Block adoption checkout
    { matcher: /\/store\/carts\/.+\/complete$/, middlewares: [blockAdoptionCheckout] },
    
    // Comprehensive anti-sale protection
    { matcher: /\/store\/carts/, middlewares: [antiSaleMiddleware, preventAdoptionProductPurchase] },
    { matcher: /\/store\/products.*\/purchase/, middlewares: [preventAdoptionProductPurchase] },
    { matcher: /\/store\/pricing/, middlewares: [preventAdoptionProductPricing] },
    { matcher: /\/store\/price/, middlewares: [preventAdoptionProductPricing] },
  ],
})


