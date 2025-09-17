import Vendor from "./src/models/vendor"
import VendorAdmin from "./src/models/vendor-admin"
import VendorService from "./src/services/vendor"

const marketplaceModule = {
  key: "marketplace",
  label: "Marketplace",
  version: "1.0.0",
  isRequired: false,
  dependencies: ["productService"],
  defaultPackage: false,
  registrationName: "marketplaceModule",
  models: [Vendor, VendorAdmin],
  services: [VendorService],
} as const

export default marketplaceModule
