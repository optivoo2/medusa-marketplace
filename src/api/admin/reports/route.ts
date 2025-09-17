import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { MARKETPLACE_MODULE } from "../../../modules/marketplace"

// GET /admin/reports - list reports (basic)
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const marketplaceService = req.scope.resolve(MARKETPLACE_MODULE)
    const { status, product_id, limit = 50, offset = 0 } = (req.query || {}) as any

    const [reports, count] = await marketplaceService.listAndCountReports(
      {
        ...(status ? { status } : {}),
        ...(product_id ? { product_id } : {}),
      },
      { take: Number(limit), skip: Number(offset), order: { created_at: "DESC" } }
    )

    res.json({ reports, count })
  } catch (e: any) {
    console.error('Erro ao listar denúncias no admin:', e)
    res.status(500).json({ error: 'Não foi possível carregar as denúncias.' })
  }
}

// POST /admin/reports/:id/action - update status
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const { id } = (req.query || {}) as any
    const { status } = (req.body || {}) as any
    if (!id || !status) {
      return res.status(400).json({ error: "id e status são obrigatórios" })
    }

    const marketplaceService = req.scope.resolve(MARKETPLACE_MODULE)
    const [report] = await marketplaceService.updateReports([{ id, status }])
    res.json({ report })
  } catch (e: any) {
    console.error('Erro ao atualizar denúncia no admin:', e)
    res.status(500).json({ error: 'Não foi possível atualizar o status da denúncia.' })
  }
}

