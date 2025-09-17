import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"

// POST /admin/reports/[id] - update status or metadata
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const { id } = req.params
    const { status, metadata } = req.body || {}
    if (!id) {
      return res.status(400).json({ error: "id é obrigatório" })
    }

    const marketplaceService = req.scope.resolve(MARKETPLACE_MODULE)
    const [report] = await marketplaceService.updateReports([{ id, ...(status ? { status } : {}), ...(metadata ? { metadata } : {}) }])
    res.json({ report })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
}


