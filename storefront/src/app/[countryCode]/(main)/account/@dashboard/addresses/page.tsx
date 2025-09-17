import { Metadata } from "next"
import { notFound } from "next/navigation"

import AddressBook from "@modules/account/components/address-book"

import { getRegion } from "@lib/data/regions"
import { retrieveCustomer } from "@lib/data/customer"

export const metadata: Metadata = {
  title: "Endereços",
  description: "Gerencie os endereços utilizados nos seus anúncios.",
}

export default async function Addresses(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params
  const customer = await retrieveCustomer()
  const region = await getRegion(countryCode)

  if (!customer || !region) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="addresses-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">Endereços do protetor</h1>
        <p className="text-base-regular">
          Atualize os locais de atendimento para visitas e entregas solidárias. Esses dados aparecem nos anúncios
          e ajudam adotantes a filtrar por cidade ou bairro.
        </p>
      </div>
      <AddressBook customer={customer} region={region} />
    </div>
  )
}
