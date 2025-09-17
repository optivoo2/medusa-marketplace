import { HttpTypes } from "@medusajs/types"
import { Text, Heading } from "@medusajs/ui"
import PetFilters from "@modules/pets/components/pet-filters"
import PetCard from "@modules/pets/components/pet-card"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type PetListingTemplateProps = {
  pets: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
  countryCode: string
  filters: {
    species?: string
    city?: string
    state?: string
    age?: string
    size?: string
    sex?: string
    search?: string
  }
}

export default function PetListingTemplate({
  pets,
  region,
  countryCode,
  filters,
}: PetListingTemplateProps) {
  const hasActiveFilters = Object.values(filters).some(Boolean)

  return (
    <div className="content-container py-6">
      {/* Header */}
      <div className="mb-8">
        <Heading level="h1" className="text-3xl font-bold mb-2">
          Pets para Adoção
        </Heading>
        <Text className="text-ui-fg-muted">
          Encontre seu novo melhor amigo. Todos os pets são para adoção gratuita.
        </Text>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <PetFilters currentFilters={filters} countryCode={countryCode} />
      </div>

      {/* Results Summary */}
      <div className="mb-6">
        <Text className="text-ui-fg-muted">
          {pets.length === 0
            ? hasActiveFilters
              ? "Nenhum pet encontrado com os filtros selecionados."
              : "Nenhum pet disponível no momento."
            : `${pets.length} pet${pets.length !== 1 ? 's' : ''} encontrado${pets.length !== 1 ? 's' : ''}`
          }
        </Text>
      </div>

      {/* Pets Grid */}
      {pets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {pets.map((pet) => (
            <PetCard
              key={pet.id}
              pet={pet}
              region={region}
              countryCode={countryCode}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Text className="text-ui-fg-muted mb-4">
            {hasActiveFilters
              ? "Tente ajustar os filtros para encontrar mais pets."
              : "Volte em breve para ver novos pets disponíveis para adoção."
            }
          </Text>
          {hasActiveFilters && (
            <LocalizedClientLink
              href="/pets"
              className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
            >
              Ver todos os pets
            </LocalizedClientLink>
          )}
        </div>
      )}

      {/* Call to Action */}
      <div className="mt-12 text-center">
        <div className="bg-ui-bg-subtle rounded-lg p-6">
          <Heading level="h2" className="text-xl font-semibold mb-2">
            Tem um pet para adoção?
          </Heading>
          <Text className="text-ui-fg-muted mb-4">
            Publique gratuitamente e ajude um pet a encontrar um lar amoroso.
          </Text>
          <LocalizedClientLink
            href="/pets/new"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-ui-button-primary hover:bg-ui-button-primary-hover"
          >
            Publicar Pet para Adoção
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}
