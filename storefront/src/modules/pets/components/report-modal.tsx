"use client"

import { Button, Text, Textarea, Select } from "@medusajs/ui"
import { useState, useCallback } from "react"

type ReportModalProps = {
  petId: string
  petTitle: string
  onClose: () => void
}

const REPORT_REASONS = [
  { value: "Cobrando pela adoção", label: "Cobrando pela adoção" },
  { value: "Conteúdo impróprio", label: "Conteúdo impróprio" },
  { value: "Fraude ou spam", label: "Fraude ou spam" },
  { value: "Informações falsas", label: "Informações falsas" },
  { value: "Outro", label: "Outro motivo" }
]

export default function ReportModal({ petId, petTitle, onClose }: ReportModalProps) {
  const [reason, setReason] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!reason) {
      setError("Por favor, selecione um motivo para a denúncia")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/store/products/${petId}/report`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          reason, 
          message: message.trim() || undefined 
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao enviar denúncia')
      }
      
      setSuccess(true)
      setTimeout(() => {
        onClose()
        setSuccess(false)
        setReason("")
        setMessage("")
      }, 2000)
    } catch (e: any) {
      setError(e.message || "Erro ao enviar denúncia")
    } finally {
      setIsSubmitting(false)
    }
  }, [petId, reason, message, onClose])

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onClose()
      setReason("")
      setMessage("")
      setError(null)
      setSuccess(false)
    }
  }, [onClose, isSubmitting])

  // Modal sempre visível quando chamado

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <Text className="text-lg font-semibold">
              Denunciar Anúncio
            </Text>
            <Button
              variant="secondary"
              size="small"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              ✕
            </Button>
          </div>

          {/* Pet Info */}
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <Text className="font-medium">{petTitle}</Text>
            <Text className="text-sm text-gray-600">
              ID: {petId}
            </Text>
          </div>

          {success ? (
            <div className="text-center py-6">
              <div className="text-green-600 text-4xl mb-2">✅</div>
              <Text className="text-green-600 font-medium">
                Denúncia enviada com sucesso!
              </Text>
              <Text className="text-sm text-gray-600 mt-2">
                Obrigado por ajudar a manter a plataforma segura.
              </Text>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Reason Selection */}
              <div>
                <Text className="font-medium mb-2">
                  Motivo da denúncia *
                </Text>
                <Select
                  value={reason}
                  onValueChange={setReason}
                  required
                >
                  <Select.Trigger>
                    <Select.Value placeholder="Selecione um motivo" />
                  </Select.Trigger>
                  <Select.Content>
                    {REPORT_REASONS.map(option => (
                      <Select.Item key={option.value} value={option.value}>
                        {option.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </div>

              {/* Additional Message */}
              <div>
                <Text className="font-medium mb-2">
                  Detalhes adicionais (opcional)
                </Text>
                <Textarea
                  placeholder="Forneça mais detalhes sobre o problema..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <Text className="text-red-600 text-sm">{error}</Text>
                </div>
              )}

              {/* Important Notice */}
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <Text className="text-yellow-800 text-xs">
                  <strong>Importante:</strong> Denúncias são analisadas pela nossa equipe. 
                  Anúncios que violem as regras serão removidos. É proibida a venda de animais.
                </Text>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                  disabled={!reason || isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Enviando..." : "Enviar Denúncia"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
