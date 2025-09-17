import { MedusaRequest, MedusaResponse } from "@medusajs/medusa"
import { Modules } from "@medusajs/framework/utils"
import { authenticateVendor } from "../authenticate-vendor"

// GET /vendor/orders - List vendor's orders
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    await authenticateVendor(req, res, async () => {
      const vendor = req.vendor
      const orderModule = req.scope.resolve(Modules.ORDER)

      const orders = await orderModule.listOrders(
        {
          metadata: {
            vendor_id: vendor.id,
          },
        },
        {
          relations: [
            "items",
            "items.variant",
            "items.variant.product",
            "customer",
            "shipping_address",
          ],
        }
      )

      res.json({ orders })
    })
  } catch (error) {
    console.error('Erro ao listar solicitações de adoção do protetor:', error)
    res.status(500).json({ error: 'Não foi possível listar as solicitações de adoção.' })
  }
}
