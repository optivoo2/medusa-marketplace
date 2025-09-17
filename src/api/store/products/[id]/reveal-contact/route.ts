import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

// POST /store/products/[id]/reveal-contact - Reveal contact info with rate limiting
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const petId = req.params.id
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown'
    
    if (!petId) {
      return res.status(400).json({ error: "ID do pet é obrigatório" })
    }

    // Verificar se o pet existe e é de adoção
    const productModule = req.scope.resolve(Modules.PRODUCT)
    const product = await productModule.retrieveProduct(petId)
    
    if (!product) {
      return res.status(404).json({ error: "Pet não encontrado" })
    }

    const metadata = product.metadata as any
    if (!metadata?.adoption) {
      return res.status(400).json({ error: "Este não é um pet de adoção" })
    }

    // Rate limiting simples (em produção, usar Redis ou similar)
    // Por agora, vamos permitir sempre, mas logar para monitoramento
    console.log(`Contact reveal request for pet ${petId} from IP ${clientIP}`)

    // Retornar informações de contato
    const contactInfo = {
      contact_email: metadata.contact_email,
      contact_phone: metadata.contact_phone,
      contact_name: metadata.contact_name,
      revealed_at: new Date().toISOString(),
      pet_id: petId
    }

    // Log para auditoria (em produção, salvar no banco)
    console.log(`Contact revealed for pet ${petId}:`, {
      email: metadata.contact_email,
      phone: metadata.contact_phone ? '***' : null,
      name: metadata.contact_name,
      ip: clientIP,
      timestamp: new Date().toISOString()
    })

    res.json({ 
      success: true,
      contact: contactInfo,
      message: "Informações de contato reveladas com sucesso"
    })

  } catch (e: any) {
    console.error('Contact reveal error:', e)
    res.status(500).json({ 
      error: "Erro interno do servidor",
      details: e.message 
    })
  }
}
