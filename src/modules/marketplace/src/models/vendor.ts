import { model } from "@medusajs/framework/utils"

const Vendor = model.define("vendor", {
  id: model.id().primaryKey(),
  name: model.text().unique(),
  description: model.text().nullable(),
  email: model.text().nullable(),
  phone: model.text().nullable(),
  website: model.text().nullable(),
  logo_url: model.text().nullable(),
  address: model.text().nullable(),
  city: model.text().nullable(),
  country: model.text().nullable(),
  postal_code: model.text().nullable(),
  is_active: model.boolean().default(true),
  metadata: model.json().nullable(),
})

export default Vendor
