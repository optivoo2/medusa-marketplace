import { Module } from "@medusajs/framework/utils"
import VendorService from "./src/services/vendor"

export const MARKETPLACE_MODULE = "marketplace"

const MarketplaceModule = Module(MARKETPLACE_MODULE, {
  service: VendorService,
})

export type MarketplaceService = InstanceType<typeof VendorService>

type ScopedContainer = {
  resolve<T = unknown>(name: string): T
}

export const resolveMarketplaceService = (scope: ScopedContainer): MarketplaceService => {
  return scope.resolve(MARKETPLACE_MODULE) as MarketplaceService
}

export default MarketplaceModule
