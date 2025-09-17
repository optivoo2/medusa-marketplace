import { MedusaRequest, MedusaResponse } from "@medusajs/medusa"

// GET /admin/settings/marketplace - Get marketplace settings
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    // In a real implementation, you would store these settings in the database
    // For now, we'll return default settings
    const settings = {
      enable_vendor_registration: true,
      require_vendor_approval: true,
      vendor_commission_rate: 10,
      allow_vendor_self_management: true,
      marketplace_fee_percentage: 5
    }

    res.json({ settings })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// PUT /admin/settings/marketplace - Update marketplace settings
export const PUT = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    // In a real implementation, you would save these settings to the database
    const settings = req.body

    // Validate settings
    if (settings.vendor_commission_rate < 0 || settings.vendor_commission_rate > 100) {
      return res.status(400).json({ error: "Commission rate must be between 0 and 100" })
    }

    if (settings.marketplace_fee_percentage < 0 || settings.marketplace_fee_percentage > 100) {
      return res.status(400).json({ error: "Marketplace fee must be between 0 and 100" })
    }

    // Save settings (implement database storage here)
    res.json({ settings })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
