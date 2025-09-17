import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { authenticateVendor } from "../authenticate-vendor"
import { Modules } from "@medusajs/framework/utils"

// GET /vendor/products - List vendor's products
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    await authenticateVendor(req, res, async () => {
      const productService = req.scope.resolve(Modules.PRODUCT)
      const vendor = (req as any).vendor

      const products = await productService.listProducts({
        // @ts-expect-error: metadata filter not in types but works in runtime
        metadata: {
          vendor_id: vendor.id
        }
      })

      res.json({ products })
    })
  } catch (error) {
    console.error('Erro ao listar anúncios do protetor:', error)
    res.status(500).json({ error: 'Não foi possível listar os anúncios.' })
  }
}

// POST /vendor/products - Create a new product for the vendor
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    await authenticateVendor(req, res, async () => {
      const productService = req.scope.resolve(Modules.PRODUCT)
      const vendor = (req as any).vendor

      const productData = {
        ...(req.body as any),
        metadata: {
          ...(req.body as any).metadata,
          vendor_id: vendor.id
        }
      }

      const product = await productService.createProducts([productData])

      res.status(201).json({ product: product[0] })
    })
  } catch (error) {
    console.error('Erro ao criar anúncio do protetor:', error)
    res.status(500).json({ error: 'Não foi possível criar o anúncio.' })
  }
}
