"use client"

import { Button, Heading } from "@medusajs/ui"

import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import DiscountCode from "@modules/checkout/components/discount-code"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

type SummaryProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[]
  }
}

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  } else {
    return "payment"
  }
}

const Summary = ({ cart }: SummaryProps) => {
  const step = getCheckoutStep(cart)
  const hasAdoptionItem = cart.items?.some((item) => {
    const metadata = item.metadata as Record<string, unknown> | undefined
    const product = item.variant?.product
    const adoptionCategory = product?.categories?.some((category: any) =>
      ["adocao", "adoption"].includes((category?.handle || "").toLowerCase())
    )

    return Boolean(metadata?.adoption) || Boolean(adoptionCategory)
  })

  return (
    <div className="flex flex-col gap-y-4">
      <Heading level="h2" className="text-[2rem] leading-[2.75rem]">
        Resumo
      </Heading>
      <DiscountCode cart={cart} />
      <Divider />
      <CartTotals totals={cart} />
      {hasAdoptionItem ? (
        <p className="text-sm text-ui-fg-subtle">
          As adoções são finalizadas diretamente com o protetor. Utilize os dados do anúncio
          para combinar a visita e avançar com a adoção.
        </p>
      ) : (
        <LocalizedClientLink
          href={"/checkout?step=" + step}
          data-testid="checkout-button"
        >
          <Button className="w-full h-10">Ir para o checkout</Button>
        </LocalizedClientLink>
      )}
    </div>
  )
}

export default Summary
