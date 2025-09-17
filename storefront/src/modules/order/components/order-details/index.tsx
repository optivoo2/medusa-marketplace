import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"

type OrderDetailsProps = {
  order: HttpTypes.StoreOrder
  showStatus?: boolean
}

const OrderDetails = ({ order, showStatus }: OrderDetailsProps) => {
  const statusMap: Record<string, string> = {
    pending: 'Pendente',
    canceled: 'Cancelado',
    cancelled: 'Cancelado',
    completed: 'Concluído',
    archived: 'Arquivado',
    requires_action: 'Aguardando ação',
    awaiting: 'Em andamento',
    fulfilled: 'Concluído',
    partial: 'Parcial',
    not_paid: 'Não pago',
    paid: 'Pago',
    awaiting_payment: 'Aguardando pagamento',
    refunded: 'Reembolsado',
  }

  const formatStatus = (str: string) => {
    if (!str) {
      return 'Indefinido'
    }
    return statusMap[str.toLowerCase()] || str
  }

  return (
    <div>
      <Text>
        Enviamos a confirmação desta solicitação para{" "}
        <span
          className="text-ui-fg-medium-plus font-semibold"
          data-testid="order-email"
        >
          {order.email}
        </span>
        .
      </Text>
      <Text className="mt-2">
        Data da solicitação:{" "}
        <span data-testid="order-date">
          {new Date(order.created_at).toLocaleDateString('pt-BR')}
        </span>
      </Text>
      <Text className="mt-2 text-ui-fg-interactive">
        Número da solicitação: <span data-testid="order-id">{order.display_id}</span>
      </Text>

      <div className="flex items-center text-compact-small gap-x-4 mt-4">
        {showStatus && (
          <>
            <Text>
              Status da solicitação:{" "}
              <span className="text-ui-fg-subtle " data-testid="order-status">
                {formatStatus(order.fulfillment_status)}
              </span>
            </Text>
            <Text>
              Status financeiro:{" "}
              <span
                className="text-ui-fg-subtle "
                sata-testid="order-payment-status"
              >
                Adoção gratuita
              </span>
            </Text>
          </>
        )}
      </div>
    </div>
  )
}

export default OrderDetails
