import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { resolveMarketplaceService } from "../../../modules/marketplace"

// POST /vendor/auth/login - Vendor login
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const { email, password } = (req.body || {}) as any

    if (!email || !password) {
      return res.status(400).json({ error: "Email e senha são obrigatórios." })
    }

    // Use Medusa's authentication service
    const authService = req.scope.resolve("authService")
    
    // Authenticate the user
    const { user, token } = await (authService as any).authenticateUser(email, password)

    if (!user) {
      return res.status(401).json({ error: "Credenciais inválidas." })
    }

    // Check if the user is a vendor admin
    const marketplaceService = resolveMarketplaceService(req.scope)
    const vendor = await marketplaceService.getVendorByUserId(user.id)

    if (!vendor) {
      return res.status(403).json({ error: "Acesso negado. Usuário não vinculado como responsável por um protetor." })
    }

    res.json({ 
      user, 
      vendor,
      token 
    })
  } catch (error) {
    console.error('Erro ao autenticar protetor:', error)
    res.status(500).json({ error: "Erro interno ao realizar login." })
  }
}
