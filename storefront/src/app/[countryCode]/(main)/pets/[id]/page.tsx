import { Metadata } from "next"
import { notFound } from "next/navigation"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import PetDetailTemplate from "@modules/pets/templates/pet-detail"

type Props = {
  params: Promise<{ countryCode: string; id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { countryCode, id } = await params
  
  try {
    const region = await getRegion(countryCode)
    if (!region) return {}

    const { response } = await listProducts({
      regionId: region.id,
      queryParams: { id },
    })
    const pet = response.products[0]

    if (!pet) return {}

    const metadata = pet.metadata as any
    const title = `${pet.title} - Pet para Adoção | PetRescue Brasil`
    const description = `Conheça ${pet.title}, um ${metadata?.species || 'pet'} ${metadata?.age || ''} ${metadata?.size || ''} em ${metadata?.city || ''}, ${metadata?.state || ''}. Adoção gratuita!`

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: pet.images?.length ? [pet.images[0].url] : ["/opengraph-pets.jpg"],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: pet.images?.length ? [pet.images[0].url] : ["/opengraph-pets.jpg"],
      },
    }
  } catch {
    return {
      title: "Pet para Adoção | PetRescue Brasil",
      description: "Encontre seu novo melhor amigo. Adoção gratuita!",
    }
  }
}

export default async function PetDetailPage({ params }: Props) {
  const { countryCode, id } = await params

  const region = await getRegion(countryCode)
  if (!region) {
    notFound()
  }

  try {
    const { response } = await listProducts({
      regionId: region.id,
      queryParams: { id },
    })
    const pet = response.products[0]

    if (!pet) {
      notFound()
    }

    // Verificar se é um pet de adoção
    const metadata = pet.metadata as any
    if (!metadata?.adoption) {
      notFound()
    }

    return (
      <PetDetailTemplate
        pet={pet}
        region={region}
        countryCode={countryCode}
      />
    )
  } catch {
    notFound()
  }
}