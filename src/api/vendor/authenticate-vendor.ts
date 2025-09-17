import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { resolveMarketplaceService } from "../../modules/marketplace"
import jwt from "jsonwebtoken"

export const authenticateVendor = async (
  req: MedusaRequest,
  res: MedusaResponse,
  next: Function
) => {
  try {
    // Get JWT token from Authorization header
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: "Autenticação obrigatória." })
    }

    const token = authHeader.substring(7)
    
    // Verify JWT token
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: "Variável JWT_SECRET não configurada." })
    }

    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (jwtError) {
      return res.status(401).json({ error: "Token inválido ou expirado." })
    }

    const userId = decoded.user_id || decoded.sub
    if (!userId) {
      return res.status(401).json({ error: "Token sem informações de usuário." })
    }

    // Get the marketplace module service
    const marketplaceService = resolveMarketplaceService(req.scope)

    // Check if the user is a vendor admin
    const vendor = await marketplaceService.getVendorByUserId(userId)

    if (!vendor) {
      return res.status(403).json({ error: "Acesso negado. Usuário não é responsável por um protetor." })
    }

    // Add vendor and user information to the request (augment type)
    ;(req as any).vendor = vendor
    ;(req as any).user = { id: userId }

    next()
  } catch (error) {
    console.error("Erro de autenticação de protetor:", error)
    return res.status(500).json({ error: "Falha ao verificar credenciais." })
  }
}
