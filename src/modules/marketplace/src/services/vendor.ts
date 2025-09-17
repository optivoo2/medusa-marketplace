import { MedusaService } from "@medusajs/framework/utils"
import Vendor from "../models/vendor"
import VendorAdmin from "../models/vendor-admin"
import Report from "../models/report"

export default class VendorService extends MedusaService({
  Vendor,
  VendorAdmin,
  Report,
}) {
  async createVendor(data: any) {
    return await this.createVendors([data])
  }

  async getVendor(id: string) {
    return await this.retrieveVendor(id)
  }

  async listVendors(filters: any = {}) {
    return await this.listVendors(filters)
  }

  async updateVendor(id: string, data: any) {
    return await this.updateVendors([{ id, ...data }])
  }

  async deleteVendor(id: string) {
    return await this.deleteVendors([id])
  }

  async addVendorAdmin(vendorId: string, userId: string, role: string = "admin") {
    return await this.createVendorAdmins([{
      vendor_id: vendorId,
      user_id: userId,
      role
    }])
  }

  async removeVendorAdmin(vendorId: string, userId: string) {
    const [admin] = await this.listVendorAdmins({
      vendor_id: vendorId,
      user_id: userId
    })
    
    if (admin) {
      await this.deleteVendorAdmins([admin.id])
    }
  }

  async getVendorByUserId(userId: string) {
    const [vendorAdmin] = await this.listVendorAdmins({
      user_id: userId
    })
    return vendorAdmin?.vendor
  }
}
