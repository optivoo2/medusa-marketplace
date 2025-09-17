import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

/**
 * Middleware to prevent any sale/payment operations on adoption products
 * This is critical for Brazilian pet adoption platform compliance
 */
export const antiSaleMiddleware = async (
  req: MedusaRequest,
  res: MedusaResponse,
  next: () => Promise<void>
) => {
  try {
    // Check if this is a cart/checkout operation
    const isCartOperation = req.url?.includes('/carts') || req.url?.includes('/checkout')
    
    if (isCartOperation && req.method !== 'GET') {
      // For cart operations, we need to check if any products are adoption products
      const productModule = req.scope.resolve(Modules.PRODUCT)
      
      // Get cart items or product IDs from request
      let productIds: string[] = []
      
      if (req.body?.items) {
        productIds = req.body.items.map((item: any) => item.product_id || item.variant_id)
      } else if (req.body?.product_id) {
        productIds = [req.body.product_id]
      } else if (req.params?.id) {
        // For cart operations, get the cart and check its items
        try {
          const cartModule = req.scope.resolve(Modules.CART)
          const cart = await cartModule.retrieveCart(req.params.id)
          if (cart?.items) {
            productIds = cart.items.map((item: any) => item.product_id)
          }
        } catch {
          // If cart doesn't exist, continue
        }
      }
      
      // Check if any products are adoption products
      if (productIds.length > 0) {
        const products = await productModule.listProducts({
          id: productIds,
          categories: { handle: "adocao" }
        })
        
        if (products.length > 0) {
          return res.status(400).json({
            error: "Venda de animais é proibida",
            message: "Este produto é para adoção gratuita. Não é permitida a venda de animais.",
            code: "ADOPTION_PRODUCT_SALE_FORBIDDEN"
          })
        }
      }
    }
    
    // Check if this is a pricing operation
    if (req.url?.includes('/prices') && req.method !== 'GET') {
      return res.status(400).json({
        error: "Preços não permitidos para adoção",
        message: "Produtos de adoção não podem ter preços definidos.",
        code: "ADOPTION_PRODUCT_PRICING_FORBIDDEN"
      })
    }
    
    await next()
  } catch (error) {
    console.error('Anti-sale middleware error:', error)
    // Don't block the request if middleware fails, but log the error
    await next()
  }
}

/**
 * Helper function to check if a product is an adoption product
 */
export const isAdoptionProduct = async (productModule: any, productId: string): Promise<boolean> => {
  try {
    const product = await productModule.retrieveProduct(productId)
    return product?.categories?.some((cat: any) => cat.handle === 'adocao') || false
  } catch {
    return false
  }
}

/**
 * Helper function to get adoption category
 */
export const getAdoptionCategory = async (productModule: any) => {
  try {
    const categories = await productModule.listProductCategories({
      handle: "adocao"
    })
    return categories[0] || null
  } catch {
    return null
  }
}
