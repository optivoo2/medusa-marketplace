"use client"

import { HttpTypes } from "@medusajs/types"
import { Text, Heading, Button } from "@medusajs/ui"
import { ArrowLeft, Heart, Share2, Flag } from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import UrgencyBadge from "@modules/pets/components/urgency-badge"
import ContactReveal from "@modules/pets/components/contact-reveal"
import SocialShare from "@modules/pets/components/social-share"
import ReportModal from "@modules/pets/components/report-modal"
import { useState } from "react"

type PetDetailTemplateProps = {
  pet: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
}

export default function PetDetailTemplate({
  pet,
  region,
  countryCode,
}: PetDetailTemplateProps) {
  const [showReportModal, setShowReportModal] = useState(false)
  const metadata = pet.metadata as any

  const formatLocation = () => {
    const parts = []
    if (metadata?.neighborhood) parts.push(metadata.neighborhood)
    if (metadata?.city) parts.push(metadata.city)
    if (metadata?.state) parts.push(metadata.state)
    return parts.join(", ")
  }

  const formatSpecies = (species: string) => {
    const speciesMap: { [key: string]: string } = {
      cao: "Cão",
      gato: "Gato",
      coelho: "Coelho",
      hamster: "Hamster",
      passaro: "Pássaro",
      peixe: "Peixe",
      outros: "Outros"
    }
    return speciesMap[species] || species
  }

  const formatAge = (age: string) => {
    const ageMap: { [key: string]: string } = {
      filhote: "Filhote (até 1 ano)",
      jovem: "Jovem (1-3 anos)",
      adulto: "Adulto (3-7 anos)",
      idoso: "Idoso (7+ anos)"
    }
    return ageMap[age] || age
  }

  const formatSize = (size: string) => {
    const sizeMap: { [key: string]: string } = {
      pequeno: "Pequeno",
      medio: "Médio",
      grande: "Grande"
    }
    return sizeMap[size] || size
  }

  const formatSex = (sex: string) => {
    const sexMap: { [key: string]: string } = {
      macho: "Macho",
      femea: "Fêmea"
    }
    return sexMap[sex] || sex
  }

  return (
    <div className="content-container py-6">
      {/* Navegação */}
      <div className="mb-6">
        <LocalizedClientLink
          href="/pets"
          className="inline-flex items-center text-ui-fg-muted hover:text-ui-fg-interactive"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para pets
        </LocalizedClientLink>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Imagens */}
        <div className="space-y-4">
          {pet.images && pet.images.length > 0 ? (
            <div className="space-y-4">
              <div className="aspect-square rounded-lg overflow-hidden bg-ui-bg-subtle">
                <img
                  src={pet.images[0].url}
                  alt={pet.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {pet.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {pet.images.slice(1, 5).map((image, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden bg-ui-bg-subtle">
                      <img
                        src={image.url}
                        alt={`${pet.title} ${index + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-square rounded-lg bg-ui-bg-subtle flex items-center justify-center">
              <Text className="text-ui-fg-muted">Sem imagem disponível</Text>
            </div>
          )}
        </div>

        {/* Informações */}
        <div className="space-y-6">
          {/* Cabeçalho */}
          <div>
            <div className="flex items-start justify-between mb-2">
              <Heading level="h1" className="text-3xl font-bold">
                {pet.title}
              </Heading>
              <UrgencyBadge highlightUntil={metadata?.highlight_until} />
            </div>
            <Text className="text-ui-fg-muted text-lg">
              {formatLocation()}
            </Text>
          </div>

          {/* Características */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-ui-bg-subtle rounded-lg p-4">
              <Text className="text-sm text-ui-fg-muted">Espécie</Text>
              <Text className="font-medium">{formatSpecies(metadata?.species)}</Text>
            </div>
            <div className="bg-ui-bg-subtle rounded-lg p-4">
              <Text className="text-sm text-ui-fg-muted">Idade</Text>
              <Text className="font-medium">{formatAge(metadata?.age)}</Text>
            </div>
            <div className="bg-ui-bg-subtle rounded-lg p-4">
              <Text className="text-sm text-ui-fg-muted">Porte</Text>
              <Text className="font-medium">{formatSize(metadata?.size)}</Text>
            </div>
            <div className="bg-ui-bg-subtle rounded-lg p-4">
              <Text className="text-sm text-ui-fg-muted">Sexo</Text>
              <Text className="font-medium">{formatSex(metadata?.sex)}</Text>
            </div>
          </div>

          {/* Descrição */}
          {pet.description && (
            <div>
              <Heading level="h2" className="text-xl font-semibold mb-3">
                Sobre {pet.title}
              </Heading>
              <Text className="text-ui-fg-base leading-relaxed">
                {pet.description}
              </Text>
            </div>
          )}

          {/* Saúde e Comportamento */}
          {(metadata?.health || metadata?.temperament) && (
            <div>
              <Heading level="h2" className="text-xl font-semibold mb-3">
                Saúde e Comportamento
              </Heading>
              <div className="space-y-3">
                {metadata?.health && (
                  <div>
                    <Text className="font-medium text-sm text-ui-fg-muted">Saúde:</Text>
                    <Text className="text-ui-fg-base">{metadata.health}</Text>
                  </div>
                )}
                {metadata?.temperament && (
                  <div>
                    <Text className="font-medium text-sm text-ui-fg-muted">Temperamento:</Text>
                    <Text className="text-ui-fg-base">{metadata.temperament}</Text>
                  </div>
                )}
                {metadata?.special_needs && (
                  <div>
                    <Text className="font-medium text-sm text-ui-fg-muted">Necessidades Especiais:</Text>
                    <Text className="text-ui-fg-base">{metadata.special_needs}</Text>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* História do Resgate */}
          {metadata?.rescue_story && (
            <div>
              <Heading level="h2" className="text-xl font-semibold mb-3">
                História do Resgate
              </Heading>
              <Text className="text-ui-fg-base leading-relaxed">
                {metadata.rescue_story}
              </Text>
            </div>
          )}

          {/* Aviso Importante */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <Text className="text-yellow-800 text-sm font-medium">
              ⚠️ Importante: Este pet é para adoção gratuita. É proibida a venda de animais.
            </Text>
          </div>

          {/* Ações */}
          <div className="space-y-4">
            <ContactReveal 
              contactEmail={metadata?.contact_email}
              contactPhone={metadata?.contact_phone}
              contactName={metadata?.contact_name}
              petId={pet.id}
            />

            <div className="flex gap-3">
              <SocialShare 
                pet={pet}
                countryCode={countryCode}
              />
              
              <Button
                variant="secondary"
                size="small"
                onClick={() => setShowReportModal(true)}
                className="flex items-center gap-2"
              >
                <Flag className="w-4 h-4" />
                Denunciar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Denúncia */}
      {showReportModal && (
        <ReportModal
          petId={pet.id}
          petTitle={pet.title}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  )
}