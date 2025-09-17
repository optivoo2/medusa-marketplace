import { model } from "@medusajs/framework/utils"

const Report = model.define("report", {
  id: model.id().primaryKey(),
  product_id: model.text(),
  reported_by_user_id: model.text().nullable(),
  reported_by_email: model.text().nullable(),
  reason: model.text(),
  message: model.text().nullable(),
  status: model.text().default("open"),
  metadata: model.json().nullable(),
})

export default Report


