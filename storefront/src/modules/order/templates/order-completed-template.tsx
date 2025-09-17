import { Heading } from "@medusajs/ui"

import Items from "@modules/order/components/items"
import OrderDetails from "@modules/order/components/order-details"
import { HttpTypes } from "@medusajs/types"

type OrderCompletedTemplateProps = {
  order: HttpTypes.StoreOrder
}

export default async function OrderCompletedTemplate({
  order,
}: OrderCompletedTemplateProps) {
  return (
    <div className="py-6 min-h-[calc(100vh-64px)]">
      <div className="content-container flex flex-col justify-center items-center gap-y-10 max-w-4xl h-full w-full">
        <div
          className="flex flex-col gap-4 max-w-4xl h-full bg-white w-full py-10"
          data-testid="order-complete-container"
        >
          <Heading
            level="h1"
            className="flex flex-col gap-y-3 text-ui-fg-base text-3xl mb-4"
          >
            <span>Obrigado por resgatar!</span>
            <span>Sua solicitação de adoção foi registrada com sucesso.</span>
          </Heading>
          <OrderDetails order={order} />
          <Heading level="h2" className="flex flex-row text-3xl-regular">
            Animais desta solicitação
          </Heading>
          <Items order={order} />
          <p className="px-8 text-sm text-ui-fg-subtle">
            Entre em contato com o protetor para alinhar visita, documentação e o melhor momento para levar o novo amigo para casa.
          </p>
        </div>
      </div>
    </div>
  )
}
