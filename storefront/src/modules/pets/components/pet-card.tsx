import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import UrgencyBadge from "./urgency-badge"

type PetCardProps = {
  pet: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
}

export default function PetCard({ pet, region, countryCode }: PetCardProps) {
  const metadata = pet.metadata as any

  return (
    <LocalizedClientLink 
      href={`/pets/${pet.id}`} 
      className="group block"
    >
      <div 
        data-testid="pet-card"
        className="bg-ui-bg-subtle rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
      >
        {/* Image */}
        <div className="relative">
          <Thumbnail
            thumbnail={pet.thumbnail}
            images={pet.images}
            size="full"
            className="aspect-square"
          />
          <UrgencyBadge 
            highlightUntil={metadata?.highlight_until} 
            className="absolute top-2 right-2" 
          />
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          {/* Title */}
          <Text className="font-semibold text-lg group-hover:text-ui-fg-interactive">
            {pet.title}
          </Text>

          {/* Pet Details */}
          <div className="space-y-1">
            {metadata?.species && (
              <Text className="text-sm text-ui-fg-muted capitalize">
                {metadata.species}
                {metadata.breed && ` • ${metadata.breed}`}
              </Text>
            )}
            
            {metadata?.age && metadata?.size && metadata?.sex && (
              <Text className="text-sm text-ui-fg-muted capitalize">
                {metadata.age} • {metadata.size} • {metadata.sex}
              </Text>
            )}

            {/* Location */}
            {metadata?.city && (
              <Text className="text-sm text-ui-fg-muted">
                📍 {metadata.city}
                {metadata.state && `, ${metadata.state}`}
              </Text>
            )}
          </div>

          {/* Special indicators */}
          <div className="flex gap-2">
            {metadata?.special_needs && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                ⚠️ Necessidades especiais
              </span>
            )}
            {metadata?.health && metadata.health.toLowerCase().includes('vacinad') && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ✅ Vacinado
              </span>
            )}
          </div>

          {/* Contact CTA */}
          <div className="pt-2">
            <Text className="text-sm font-medium text-ui-fg-interactive">
              Entrar em contato →
            </Text>
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
