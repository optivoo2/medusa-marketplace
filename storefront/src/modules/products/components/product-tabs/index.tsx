"use client"

import Back from "@modules/common/icons/back"
import FastDelivery from "@modules/common/icons/fast-delivery"
import Refresh from "@modules/common/icons/refresh"

import Accordion from "./accordion"
import { HttpTypes } from "@medusajs/types"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  const tabs = [
    {
      label: "Informações do animal",
      component: <ProductInfoTab product={product} />,
    },
    {
      label: "Como funciona a adoção",
      component: <AdoptionInfoTab product={product} />,
    },
  ]

  return (
    <div className="w-full">
      <Accordion type="multiple">
        {tabs.map((tab, i) => (
          <Accordion.Item
            key={i}
            title={tab.label}
            headingSize="medium"
            value={tab.label}
          >
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

const ProductInfoTab = ({ product }: ProductTabsProps) => {
  const metadata = (product.metadata || {}) as Record<string, string>

  const characteristics = [
    { label: "Espécie", value: metadata.species },
    { label: "Raça", value: metadata.breed },
    { label: "Idade", value: metadata.age },
    { label: "Porte", value: metadata.size },
    { label: "Sexo", value: metadata.sex },
  ]

  const healthInfo = [
    { label: "Saúde / Vacinas", value: metadata.health },
    { label: "Temperamento", value: metadata.temperament },
    { label: "Necessidades especiais", value: metadata.special_needs },
    {
      label: "História do resgate",
      value: metadata.rescue_story,
    },
  ]

  const locationInfo = [
    {
      label: "Cidade",
      value: metadata.city ? metadata.city.split(" ").map(capitalize).join(" ") : undefined,
    },
    { label: "Bairro", value: metadata.neighborhood },
    { label: "Estado", value: metadata.state },
  ]

  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <InfoColumn title="Características" items={characteristics} />
        <InfoColumn title="Sobre o animal" items={healthInfo} />
        <InfoColumn title="Localização" items={locationInfo} />
      </div>
    </div>
  )
}

const InfoColumn = ({
  title,
  items,
}: {
  title: string
  items: { label: string; value?: string }[]
}) => {
  return (
    <div className="flex flex-col gap-y-4">
      <h4 className="font-semibold text-base">{title}</h4>
      {items.map((item) => (
        <div key={item.label}>
          <span className="font-semibold">{item.label}</span>
          <p>{item.value && item.value.trim() ? item.value : "Não informado"}</p>
        </div>
      ))}
    </div>
  )
}

const capitalize = (value: string) => {
  if (!value) {
    return value
  }
  return value.charAt(0).toUpperCase() + value.slice(1)
}

const AdoptionInfoTab = ({ product }: ProductTabsProps) => {
  const metadata = (product.metadata || {}) as Record<string, string>
  const contactEmail = metadata.contact_email
  const contactPhone = metadata.contact_phone

  return (
    <div className="text-small-regular py-8 space-y-6">
      <div className="flex items-start gap-x-2">
        <FastDelivery />
        <div>
          <span className="font-semibold">Processo rápido e transparente</span>
          <p className="max-w-md">
            Combine uma visita com o protetor para conhecer o animal pessoalmente. As adoções são gratuitas e
            seguem as diretrizes do PetRescue Brasil.
          </p>
        </div>
      </div>
      <div className="flex items-start gap-x-2">
        <Refresh />
        <div>
          <span className="font-semibold">Atualize o status após a adoção</span>
          <p className="max-w-md">
            Assim que o animal for adotado, peça ao protetor para marcar o anúncio como “Adotado” e evitar novos contatos.
          </p>
        </div>
      </div>
      <div className="flex items-start gap-x-2">
        <Back />
        <div>
          <span className="font-semibold">Entrar em contato</span>
          <p className="max-w-md">
            Email: {contactEmail || 'informação disponível após login'}<br />
            Telefone: {contactPhone || 'informação fornecida pelo protetor'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default ProductTabs
