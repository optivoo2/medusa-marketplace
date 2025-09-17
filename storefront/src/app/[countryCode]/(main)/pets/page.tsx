import { Metadata } from "next"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import PetListingTemplate from "@modules/pets/templates/pet-listing"
import { notFound } from "next/navigation"

type Props = {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export const metadata: Metadata = {
  title: "Pets para Adoção | PetRescue Brasil",
  description: "Encontre seu novo melhor amigo. Pets resgatados esperando por um lar amoroso em São Paulo, Rio de Janeiro e Belo Horizonte.",
  openGraph: {
    title: "Pets para Adoção | PetRescue Brasil",
    description: "Encontre seu novo melhor amigo. Pets resgatados esperando por um lar amoroso.",
    images: ["/opengraph-pets.jpg"],
  },
}

export default async function PetsPage(props: Props) {
  const params = await props.params
  const searchParams = await props.searchParams
  const { countryCode } = params

  const region = await getRegion(countryCode)
  if (!region) {
    notFound()
  }

  // Extract filter parameters
  const species = searchParams.species as string
  const city = searchParams.city as string
  const state = searchParams.state as string
  const age = searchParams.age as string
  const size = searchParams.size as string
  const sex = searchParams.sex as string
  const search = searchParams.search as string

  // Build query parameters for adoption products
  const queryParams: any = {
    // Filter by adoption category
    category_handle: "adocao",
    // Show only published products
    status: "published",
    // Include all necessary fields
    fields: "*variants.calculated_price,metadata",
    // Default limit
    limit: 24,
  }

  // Add filters if provided
  if (species) {
    queryParams.tags = [`${species}`]
  }
  if (city) {
    queryParams.tags = [...(queryParams.tags || []), `${city}`]
  }
  if (state) {
    queryParams.tags = [...(queryParams.tags || []), `${state}`]
  }
  if (age) {
    queryParams.tags = [...(queryParams.tags || []), `${age}`]
  }
  if (size) {
    queryParams.tags = [...(queryParams.tags || []), `${size}`]
  }
  if (sex) {
    queryParams.tags = [...(queryParams.tags || []), `${sex}`]
  }
  if (search) {
    queryParams.q = search
  }

  // Fetch adoption products
  const { response } = await listProducts({
    regionId: region.id,
    queryParams,
  })

  const pets = response.products || []

  return (
    <PetListingTemplate
      pets={pets}
      region={region}
      countryCode={countryCode}
      filters={{
        species,
        city,
        state,
        age,
        size,
        sex,
        search,
      }}
    />
  )
}
