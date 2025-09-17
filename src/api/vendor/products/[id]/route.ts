import { MedusaRequest, MedusaResponse } from "@medusajs/medusa"
import { authenticateVendor } from "../../authenticate-vendor"

// GET /vendor/products/[id] - Get a specific vendor's product
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    await authenticateVendor(req, res, async () => {
      const productService = req.scope.resolve("productService")
      const vendor = req.vendor
      const productId = req.params.id

      const product = await productService.retrieve(productId)

      // Verify the product belongs to this vendor
      if (product.vendor_id !== vendor.id) {
        return res.status(403).json({ error: "Access denied. Product does not belong to this vendor." })
      }

      res.json({ product })
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// PUT /vendor/products/[id] - Update a vendor's product
export const PUT = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    await authenticateVendor(req, res, async () => {
      const productService = req.scope.resolve("productService")
      const vendor = req.vendor
      const productId = req.params.id

      const product = await productService.retrieve(productId)

      // Verify the product belongs to this vendor
      if (product.vendor_id !== vendor.id) {
        return res.status(403).json({ error: "Access denied. Product does not belong to this vendor." })
      }

      const updatedProduct = await productService.update(productId, req.body)

      res.json({ product: updatedProduct })
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// DELETE /vendor/products/[id] - Delete a vendor's product
export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    await authenticateVendor(req, res, async () => {
      const productService = req.scope.resolve("productService")
      const vendor = req.vendor
      const productId = req.params.id

      const product = await productService.retrieve(productId)

      // Verify the product belongs to this vendor
      if (product.vendor_id !== vendor.id) {
        return res.status(403).json({ error: "Access denied. Product does not belong to this vendor." })
      }

      await productService.delete(productId)

      res.status(204).send()
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
