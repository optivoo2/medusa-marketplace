import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    // Basic health check
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "petrescue-brasil-backend",
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV || "development",
      features: {
        antiSaleProtection: true,
        adoptionPolicy: true,
        observability: process.env.ENABLE_INSTRUMENTATION === "true"
      }
    }
    
    return res.json(health)
  } catch (error) {
    return res.status(500).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: "Health check failed",
      service: "petrescue-brasil-backend"
    })
  }
}
