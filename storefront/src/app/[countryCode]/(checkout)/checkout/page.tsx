import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { Heading, Text } from "@medusajs/ui"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Solicitar adoção",
}

export default async function Checkout({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  const cart = await retrieveCart()

  if (!cart) {
    return notFound()
  }

  const customer = await retrieveCustomer()

  const hasAdoptionItem = cart.items?.some((item) => {
    const metadata = item.metadata as Record<string, unknown> | undefined
    const product = item.variant?.product

    const isAdoptionCategory = product?.collection?.handle === "adocao" ||
      product?.categories?.some((category: any) => category?.handle === "adocao")

    return Boolean(metadata?.adoption) || Boolean(isAdoptionCategory)
  })

  if (!cart.items?.length) {
    return notFound()
  }

  if (hasAdoptionItem) {
    const adoptionHref = `/${countryCode}/collections/adocao`

    return (
      <div className="content-container py-12">
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
          <Heading level="h1" className="text-3xl">
            Contato com o protetor
          </Heading>
          <Text className="text-base-regular text-ui-fg-base">
            Adoções no PetRescue Brasil são sempre gratuitas. Para finalizar o processo,
            entre em contato diretamente com o protetor responsável pelo animal usando
            os dados informados no anúncio.
          </Text>
          <div className="space-y-2">
            <Text className="font-semibold">Próximos passos recomendados:</Text>
            <ul className="list-disc pl-6 text-ui-fg-subtle space-y-1">
              <li>Confirme nome e código do animal com o protetor.</li>
              <li>Combine uma visita segura e leve seus documentos pessoais.</li>
              <li>Denuncie qualquer tentativa de cobrança através da página do anúncio.</li>
            </ul>
          </div>
          {!customer && (
            <Text className="text-sm text-ui-fg-subtle">
              Faça login para salvar informações e acompanhar denúncias em tempo real.
            </Text>
          )}
          <a href={adoptionHref} className="text-ui-fg-interactive underline">
            Voltar para os animais disponíveis
          </a>
        </div>
      </div>
    )
  }

  return notFound()
}
