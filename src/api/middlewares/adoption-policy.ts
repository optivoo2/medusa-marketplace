import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

/**
 * Middleware to prevent adoption products from being added to cart or purchased
 */
export const preventAdoptionProductPurchase = async (
  req: MedusaRequest,
  res: MedusaResponse,
  next: () => void
) => {
  try {
    const productModule = req.scope.resolve(Modules.PRODUCT)
    
    // Check if this is a cart operation
    if (req.method === "POST" && req.url?.includes("/carts/")) {
      const { items } = req.body || {}
      
      if (items && Array.isArray(items)) {
        for (const item of items) {
          if (item.variant_id) {
            // Get the product for this variant
            const variant = await productModule.retrieveProductVariant(item.variant_id)
            const product = await productModule.retrieveProduct(variant.product_id)
            
            // Check if this is an adoption product
            if (product.metadata?.adoption === true) {
              return res.status(400).json({
                error: "Produtos de adoção não podem ser comprados. Entre em contato diretamente com o responsável.",
                code: "ADOPTION_PRODUCT_NOT_PURCHASABLE"
              })
            }
          }
        }
      }
    }
    
    // Check if this is a direct product purchase
    if (req.method === "POST" && req.url?.includes("/products/") && req.url?.includes("/purchase")) {
      const productId = req.params?.id
      if (productId) {
        const product = await productModule.retrieveProduct(productId)
        if (product.metadata?.adoption === true) {
          return res.status(400).json({
            error: "Produtos de adoção não podem ser comprados. Entre em contato diretamente com o responsável.",
            code: "ADOPTION_PRODUCT_NOT_PURCHASABLE"
          })
        }
      }
    }
    
    next()
  } catch (error) {
    // If there's an error checking the product, allow the request to continue
    // This prevents the middleware from breaking normal operations
    next()
  }
}

/**
 * Middleware to prevent pricing/checkout for adoption products
 */
export const preventAdoptionProductPricing = async (
  req: MedusaRequest,
  res: MedusaResponse,
  next: () => void
) => {
  try {
    const productModule = req.scope.resolve(Modules.PRODUCT)
    
    // Check if this is a pricing request
    if (req.url?.includes("/pricing") || req.url?.includes("/price")) {
      const productId = req.params?.id || req.query?.product_id
      
      if (productId) {
        const product = await productModule.retrieveProduct(productId)
        if (product.metadata?.adoption === true) {
          return res.status(400).json({
            error: "Produtos de adoção não possuem preço. Entre em contato diretamente com o responsável.",
            code: "ADOPTION_PRODUCT_NO_PRICING"
          })
        }
      }
    }
    
    next()
  } catch (error) {
    next()
  }
}

