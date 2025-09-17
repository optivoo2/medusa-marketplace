import { MedusaService } from "@medusajs/framework/utils"
import Vendor from "../models/vendor"
import VendorAdmin from "../models/vendor-admin"
import Report from "../models/report"

export default class VendorService extends MedusaService({
  Vendor,
  VendorAdmin,
  Report,
}) {}
