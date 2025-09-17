import { Module } from "@medusajs/framework/utils"
import VendorService from "./src/services/vendor"

export const MARKETPLACE_MODULE = "marketplace"

export default Module(MARKETPLACE_MODULE, {
  service: VendorService,
})
