import { createWorkflow, transform } from "@medusajs/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"

// Input type for the workflow
type SplitOrderByVendorInput = {
  cart_id: string
}

// Create the workflow
export const splitOrderByVendorWorkflow = createWorkflow(
  "split-order-by-vendor",
  function (input: SplitOrderByVendorInput) {
    // Step 1: Get cart data
    const cart = transform(
      { cart_id: input.cart_id },
      async ({ cart_id }, { container }) => {
        const cartService = container.resolve(Modules.CART)
        const cart = await cartService.retrieveCart(cart_id)
        return cart
      }
    )

    // Step 2: Split order items by vendor
    const splitData = transform(
      { cart },
      async ({ cart }) => {
        const vendorGroups = new Map()

        // Group cart items by vendor
        for (const item of cart.items || []) {
          const vendorId = (item as any).variant?.product?.metadata?.vendor_id

          if (!vendorId) {
            // Handle items without vendor (admin products)
            if (!vendorGroups.has("admin")) {
              vendorGroups.set("admin", [])
            }
            vendorGroups.get("admin").push(item)
          } else {
            if (!vendorGroups.has(vendorId)) {
              vendorGroups.set(vendorId, [])
            }
            vendorGroups.get(vendorId).push(item)
          }
        }

        return {
          originalCart: cart,
          vendorGroups: Array.from(vendorGroups.entries()).map(([vendorId, items]) => ({
            vendor_id: vendorId,
            items: items
          }))
        }
      }
    )

    // Step 3: Create orders for each vendor
    const orderData = transform(
      { splitData },
      async ({ splitData }, { container }) => {
        const orderService = container.resolve(Modules.ORDER)
        const cartService = container.resolve(Modules.CART)
        const createdOrders: any[] = []

        for (const vendorGroup of splitData.vendorGroups) {
          // Create a new cart for this vendor
          const newCart = await cartService.createCarts([{
            region_id: splitData.originalCart.region_id,
            currency_code: splitData.originalCart.currency_code,
            customer_id: splitData.originalCart.customer_id,
            metadata: {
              ...splitData.originalCart.metadata,
              vendor_id: vendorGroup.vendor_id,
              parent_cart_id: splitData.originalCart.id
            }
          }])

          // Add items to the new cart
          for (const item of vendorGroup.items) {
            await cartService.addLineItems(newCart[0].id, [{
              variant_id: (item as any).variant_id,
              quantity: (item as any).quantity,
              title: "Product",
              unit_price: 0,
              metadata: (item as any).metadata
            }])
          }

          // Complete the cart to create an order
          const order = await orderService.createOrders([{
            // @ts-expect-error: cart_id not in types but works in runtime
            cart_id: newCart[0].id
          }])

          // Add vendor information to the order
          await orderService.updateOrders([{
            id: order[0].id,
            metadata: {
              ...order[0].metadata,
              vendor_id: vendorGroup.vendor_id,
              parent_order_id: splitData.originalCart.id
            }
          }])

          createdOrders.push({
            ...order[0],
            vendor_id: vendorGroup.vendor_id
          })
        }

        return {
          originalCart: splitData.originalCart,
          vendorOrders: createdOrders
        }
      }
    )

    return orderData as any
  }
)