import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { authenticateVendor } from "../authenticate-vendor"

// GET /vendor/profile - Get vendor profile
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    await authenticateVendor(req, res, async () => {
      const vendor = (req as any).vendor
      const userModule = req.scope.resolve(Modules.USER)
      let user = (req as any).user || null

      if (user?.id) {
        try {
          const [foundUser] = await userModule.listUsers({ id: [user.id] } as any)
          if (foundUser) {
            user = {
              id: foundUser.id,
              email: foundUser.email,
            }
          }
        } catch (listError) {
          console.error('Não foi possível recuperar dados do usuário autenticado:', listError)
        }
      }

      res.json({ vendor, user })
    })
  } catch (error) {
    console.error('Erro ao carregar perfil do protetor:', error)
    res.status(500).json({ error: 'Não foi possível carregar o perfil.' })
  }
}

// PUT /vendor/profile - Update vendor profile
export const PUT = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    await authenticateVendor(req, res, async () => {
      const marketplaceService = req.scope.resolve("marketplaceModule")
      const vendor = (req as any).vendor

      const updatedVendor = await (marketplaceService as any).updateVendorsCustom(vendor.id, req.body)

      res.json({ vendor: updatedVendor })
    })
  } catch (error) {
    console.error('Erro ao atualizar perfil do protetor:', error)
    res.status(500).json({ error: 'Não foi possível atualizar o perfil.' })
  }
}
