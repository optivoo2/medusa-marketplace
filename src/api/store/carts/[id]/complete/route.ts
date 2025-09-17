import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { splitOrderByVendorWorkflow } from "../../../../../workflows/split-order-by-vendor"

// POST /store/carts/[id]/complete - Complete cart with vendor order splitting
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const cartId = req.params.id

    // Check for adoption products before completing cart
    const cartModule = req.scope.resolve(Modules.CART)
    const productModule = req.scope.resolve(Modules.PRODUCT)
    
    const cart = await cartModule.retrieveCart(cartId)
    
    if (cart?.items && cart.items.length > 0) {
      // Check if any items are adoption products
      const productIds = cart.items.map((item: any) => item.product_id)
      // Prefer category ID lookups to avoid type mismatch on filters
      const adoptionCategory = await productModule.listProductCategories({ handle: "adocao" })
      const adoptionCategoryId = adoptionCategory?.[0]?.id
      const adoptionProducts = adoptionCategoryId
        ? await productModule.listProducts({ id: productIds, categories: { id: [adoptionCategoryId] } })
        : []
      
      if (adoptionProducts.length > 0) {
        return res.status(400).json({
          error: "Venda de animais é proibida",
          message: "Não é possível finalizar compra com produtos de adoção. Animais devem ser adotados gratuitamente.",
          code: "ADOPTION_PRODUCT_CHECKOUT_FORBIDDEN"
        })
      }
    }

    // Run the split order workflow
    const { result } = await splitOrderByVendorWorkflow(req.scope).run({
      input: {
        cart_id: cartId
      }
    })

    const r: any = result as any
    res.json({
      order: r.originalCart,
      vendor_orders: r.vendorOrders
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
