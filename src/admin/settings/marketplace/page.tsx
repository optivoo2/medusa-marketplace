import React, { useState, useEffect } from "react"
import { 
  Container, 
  Heading, 
  Form, 
  Input, 
  Switch, 
  Button,
  Text
} from "@medusajs/ui"

interface MarketplaceSettings {
  enable_vendor_registration: boolean
  require_vendor_approval: boolean
  vendor_commission_rate: number
  allow_vendor_self_management: boolean
  marketplace_fee_percentage: number
}

export const MarketplaceSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<MarketplaceSettings>({
    enable_vendor_registration: true,
    require_vendor_approval: true,
    vendor_commission_rate: 10,
    allow_vendor_self_management: true,
    marketplace_fee_percentage: 5
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/admin/settings/marketplace")
      const data = await response.json()
      setSettings(data.settings)
    } catch (error) {
      console.error("Error fetching settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      await fetch("/admin/settings/marketplace", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      })
    } catch (error) {
      console.error("Error saving settings:", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Container className="p-6">
        <Text>Loading settings...</Text>
      </Container>
    )
  }

  return (
    <Container className="p-6">
      <Heading level="h1" className="mb-6">
        Marketplace Settings
      </Heading>

      <form onSubmit={handleSave}>
        <div className="space-y-6">
          <Form.Field>
            <div className="flex items-center justify-between">
              <div>
                <Form.Label>Enable Vendor Registration</Form.Label>
                <Form.Hint>Allow new vendors to register on the platform</Form.Hint>
              </div>
              <Switch
                checked={settings.enable_vendor_registration}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, enable_vendor_registration: checked })
                }
              />
            </div>
          </Form.Field>

          <Form.Field>
            <div className="flex items-center justify-between">
              <div>
                <Form.Label>Require Vendor Approval</Form.Label>
                <Form.Hint>New vendors must be approved before they can sell</Form.Hint>
              </div>
              <Switch
                checked={settings.require_vendor_approval}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, require_vendor_approval: checked })
                }
              />
            </div>
          </Form.Field>

          <Form.Field>
            <div className="flex items-center justify-between">
              <div>
                <Form.Label>Allow Vendor Self Management</Form.Label>
                <Form.Hint>Vendors can manage their own products and orders</Form.Hint>
              </div>
              <Switch
                checked={settings.allow_vendor_self_management}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, allow_vendor_self_management: checked })
                }
              />
            </div>
          </Form.Field>

          <Form.Field>
            <Form.Label>Vendor Commission Rate (%)</Form.Label>
            <Form.Control>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={settings.vendor_commission_rate}
                onChange={(e) => 
                  setSettings({ 
                    ...settings, 
                    vendor_commission_rate: parseFloat(e.target.value) 
                  })
                }
              />
            </Form.Control>
            <Form.Hint>Percentage of sales that goes to the vendor</Form.Hint>
          </Form.Field>

          <Form.Field>
            <Form.Label>Marketplace Fee Percentage (%)</Form.Label>
            <Form.Control>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={settings.marketplace_fee_percentage}
                onChange={(e) => 
                  setSettings({ 
                    ...settings, 
                    marketplace_fee_percentage: parseFloat(e.target.value) 
                  })
                }
              />
            </Form.Control>
            <Form.Hint>Platform fee percentage on each transaction</Form.Hint>
          </Form.Field>
        </div>

        <div className="mt-8">
          <Button type="submit" loading={saving}>
            Save Settings
          </Button>
        </div>
      </form>
    </Container>
  )
}

export default MarketplaceSettingsPage
