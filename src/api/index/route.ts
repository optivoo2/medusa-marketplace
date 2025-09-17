import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const baseUrl = process.env.MEDUSA_BACKEND_URL || `https://${req.get('host')}`
  
  const response = {
    service: "PetRescue Brasil - Medusa Marketplace",
    version: "1.0.0",
    status: "healthy",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: `${baseUrl}/health`,
      store: {
        products: `${baseUrl}/store/products`,
        categories: `${baseUrl}/store/categories`,
        regions: `${baseUrl}/store/regions`,
        auth: `${baseUrl}/store/auth`
      },
      admin: {
        dashboard: `${baseUrl}/app`,
        api: `${baseUrl}/admin`
      },
      vendor: {
        auth: `${baseUrl}/vendor/auth`,
        products: `${baseUrl}/vendor/products`
      }
    },
    documentation: {
      medusa: "https://docs.medusajs.com",
      api: `${baseUrl}/admin` // Admin API docs
    }
  }
  
  return res.json(response)
}
