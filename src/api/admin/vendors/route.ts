import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { MARKETPLACE_MODULE } from "../../../modules/marketplace"

// GET /admin/vendors - List all vendors
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const marketplaceService = req.scope.resolve(MARKETPLACE_MODULE)
    
    const vendors = await marketplaceService.listVendors()

    res.json({ vendors })
  } catch (error) {
    console.error('Erro ao listar protetores no admin:', error)
    res.status(500).json({ error: 'Não foi possível listar os protetores cadastrados.' })
  }
}

// POST /admin/vendors - Create a new vendor
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const marketplaceService = req.scope.resolve(MARKETPLACE_MODULE)
    
    const vendor = await marketplaceService.createVendors([req.body])

    res.status(201).json({ vendor })
  } catch (error) {
    console.error('Erro ao criar protetor no admin:', error)
    res.status(500).json({ error: 'Não foi possível criar o protetor.' })
  }
}
