import React from "react"
import { Container, Heading, Text, Badge } from "@medusajs/ui"
import { defineWidgetConfig } from "@medusajs/admin-sdk"

interface ProductVendorWidgetProps {
  product: {
    vendor_id?: string
    vendor?: {
      id: string
      name: string
      email: string
      is_active: boolean
    }
  }
}

const ProductVendorWidget: React.FC<ProductVendorWidgetProps> = ({ product }) => {
  if (!product.vendor) {
    return (
      <Container className="p-4">
        <Heading level="h3" className="mb-2">
          Vendor Information
        </Heading>
        <Text className="text-gray-500">No vendor assigned to this product</Text>
      </Container>
    )
  }

  return (
    <Container className="p-4">
      <Heading level="h3" className="mb-4">
        Vendor Information
      </Heading>
      
      <div className="space-y-3">
        <div>
          <Text className="font-medium">Vendor Name:</Text>
          <Text>{product.vendor.name}</Text>
        </div>
        
        <div>
          <Text className="font-medium">Email:</Text>
          <Text>{product.vendor.email}</Text>
        </div>
        
        <div>
          <Text className="font-medium">Status:</Text>
          <Badge color={product.vendor.is_active ? "green" : "red"}>
            {product.vendor.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>
    </Container>
  )
}

// The widget's configurations
export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductVendorWidget
