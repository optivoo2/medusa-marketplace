import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { resolveMarketplaceService } from "../../../../../modules/marketplace"

// POST /store/products/[id]/report - Create a report for a product
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const productId = req.params.id
    const { reason, message } = (req.body || {}) as any

    if (!reason) {
      return res.status(400).json({ error: "reason é obrigatório" })
    }

    // Try to identify the reporter (customer) if authenticated
    let reportedByUserId: string | undefined
    let reportedByEmail: string | undefined

    try {
      const customerModule = req.scope.resolve(Modules.CUSTOMER)
      const authUser = (req as any).auth?.user
      if (authUser?.id) {
        const customers = await customerModule.listCustomers({
          user_id: authUser.id,
        } as any)
        const customer = customers?.[0]
        if (customer) {
          reportedByUserId = customer.id
          reportedByEmail = customer.email
        }
      }
    } catch {
      // ignore if customer module/auth not available in context
    }

    const marketplaceService = resolveMarketplaceService(req.scope)

    const report = await marketplaceService.createReports([
      {
        product_id: productId,
        reported_by_user_id: reportedByUserId,
        reported_by_email: reportedByEmail,
        reason,
        message,
        status: "open",
      },
    ])

    // increment a simple counter on product metadata (best-effort)
    try {
      const productModule = req.scope.resolve(Modules.PRODUCT)
      const product = await productModule.retrieveProduct(productId)
      const current = (product.metadata as any)?.reported_count || 0
      await productModule.updateProducts(productId, {
        metadata: { ...(product.metadata || {}), reported_count: current + 1 },
      })
    } catch {
      // non-blocking
    }

    return res.status(201).json({ report: report[0] })
  } catch (e: any) {
    return res.status(500).json({ error: e.message })
  }
}

