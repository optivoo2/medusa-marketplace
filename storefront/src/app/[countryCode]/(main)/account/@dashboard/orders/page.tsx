import { Metadata } from "next"

import OrderOverview from "@modules/account/components/order-overview"
import { notFound } from "next/navigation"
import { listOrders } from "@lib/data/orders"
import Divider from "@modules/common/components/divider"

export const metadata: Metadata = {
  title: "Solicitações",
  description: "Acompanhe pedidos de adoção enviados e seu status.",
}

export default async function Orders() {
  const orders = await listOrders()

  if (!orders) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="orders-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">Solicitações de adoção</h1>
        <p className="text-base-regular">
          Veja os pedidos enviados pelos adotantes e acompanhe o andamento. Atualize cada solicitação conforme a visita,
          aprovação ou finalização da adoção.
        </p>
      </div>
      <div>
        <OrderOverview orders={orders} />
        <Divider className="my-16" />
        <p className="text-sm text-ui-fg-subtle">
          Caso uma solicitação não apareça aqui, peça ao adotante que confirme o contato por email ou WhatsApp.
        </p>
      </div>
    </div>
  )
}
