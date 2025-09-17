import { model } from "@medusajs/framework/utils"

const VendorAdmin = model.define("vendor_admin", {
  id: model.id().primaryKey(),
  user_id: model.text(),
  vendor_id: model.text(),
  role: model.text().default("admin"),
  is_active: model.boolean().default(true),
  metadata: model.json().nullable(),
})

export default VendorAdmin
