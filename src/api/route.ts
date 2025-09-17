import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  return res.json({
    service: "petrescue-brasil-backend",
    status: "ok",
    message: "API operacional. Use /health, /store/* ou /admin/* para endpoints específicos.",
    docs: "https://docs.medusajs.com"
  })
}
