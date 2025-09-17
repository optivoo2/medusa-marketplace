import React, { useState, useEffect } from "react"
import { 
  Container, 
  Heading, 
  Table, 
  Badge, 
  Button, 
  Input,
  Form,
  Text
} from "@medusajs/ui"

interface Vendor {
  id: string
  name: string
  email: string
  is_active: boolean
  created_at: string
  admins: Array<{
    id: string
    user_id: string
    role: string
  }>
}

export const VendorsPage: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchVendors()
  }, [])

  const fetchVendors = async () => {
    try {
      const response = await fetch("/admin/vendors")
      const data = await response.json()
      setVendors(data.vendors)
    } catch (error) {
      console.error("Error fetching vendors:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredVendors = vendors.filter(vendor =>
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <Container className="p-6">
        <Text>Loading vendors...</Text>
      </Container>
    )
  }

  return (
    <Container className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Heading level="h1">Vendors</Heading>
        <Button onClick={() => setShowCreateModal(true)}>
          Add Vendor
        </Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search vendors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Email</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell>Admins</Table.HeaderCell>
            <Table.HeaderCell>Created</Table.HeaderCell>
            <Table.HeaderCell>Actions</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {filteredVendors.map((vendor) => (
            <Table.Row key={vendor.id}>
              <Table.Cell>{vendor.name}</Table.Cell>
              <Table.Cell>{vendor.email}</Table.Cell>
              <Table.Cell>
                <Badge color={vendor.is_active ? "green" : "red"}>
                  {vendor.is_active ? "Active" : "Inactive"}
                </Badge>
              </Table.Cell>
              <Table.Cell>{vendor.admins.length}</Table.Cell>
              <Table.Cell>
                {new Date(vendor.created_at).toLocaleDateString()}
              </Table.Cell>
              <Table.Cell>
                <Button variant="secondary" size="small">
                  Edit
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <CreateVendorModal
              onClose={() => setShowCreateModal(false)}
              onSuccess={fetchVendors}
            />
          </div>
        </div>
      )}
    </Container>
  )
}

const CreateVendorModal: React.FC<{
  onClose: () => void
  onSuccess: () => void
}> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    description: "",
    phone: "",
    website: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetch("/admin/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      onSuccess()
      onClose()
    } catch (error) {
      console.error("Error creating vendor:", error)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Heading level="h2">Create New Vendor</Heading>
        <Button variant="secondary" onClick={onClose}>
          ×
        </Button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Form.Field>
            <Form.Label>Name</Form.Label>
            <Form.Control>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Form.Control>
          </Form.Field>
          
          <Form.Field>
            <Form.Label>Email</Form.Label>
            <Form.Control>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </Form.Control>
          </Form.Field>
          
          <Form.Field>
            <Form.Label>Description</Form.Label>
            <Form.Control>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Form.Control>
          </Form.Field>
        </div>
        <div className="flex justify-end space-x-2 mt-6">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Create Vendor</Button>
        </div>
      </form>
    </div>
  )
}

export default VendorsPage
