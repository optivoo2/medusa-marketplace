import { MedusaService } from "@medusajs/framework/utils"
import Vendor from "../models/vendor"
import VendorAdmin from "../models/vendor-admin"
import Report from "../models/report"

export default class VendorService extends MedusaService({
  Vendor,
  VendorAdmin,
  Report,
}) {
  /**
   * Finds an active vendor by the associated user id.
   */
  async getVendorByUserId(userId: string) {
    const [admin] = await this.listVendorAdmins({
      user_id: userId,
      is_active: true,
    })

    if (!admin) {
      return null
    }

    try {
      return await this.retrieveVendor(admin.vendor_id)
    } catch {
      return null
    }
  }
}
