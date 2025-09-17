"use client"

import { Button, Text } from "@medusajs/ui"
import { useState, useCallback } from "react"

type ContactRevealProps = {
  contactEmail?: string
  contactPhone?: string
  contactName?: string
  petId: string
}

export default function ContactReveal({ 
  contactEmail, 
  contactPhone, 
  contactName, 
  petId 
}: ContactRevealProps) {
  const [isRevealed, setIsRevealed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const revealContact = useCallback(async () => {
    if (isRevealed) return

    setIsLoading(true)
    setError(null)

    try {
      // Chamar API para revelar contato (com rate limiting)
      const response = await fetch(`/store/products/${petId}/reveal-contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao carregar contato')
      }

      setIsRevealed(true)
    } catch (e: any) {
      setError(e.message || "Erro ao carregar informações de contato")
    } finally {
      setIsLoading(false)
    }
  }, [isRevealed, petId])

  if (!contactEmail && !contactPhone) {
    return null
  }

  return (
    <div className="space-y-4">
      <div>
        <Text className="font-semibold text-lg mb-2">
          Entre em Contato
        </Text>
        <Text className="text-sm text-ui-fg-muted mb-4">
          Para adotar este pet, entre em contato diretamente com o responsável.
        </Text>
      </div>

      {!isRevealed ? (
        <div className="space-y-3">
          <Button
            onClick={revealContact}
            isLoading={isLoading}
            disabled={isLoading}
            className="w-full"
            variant="primary"
          >
            {isLoading ? "Carregando..." : "Mostrar Contato"}
          </Button>
          
          {error && (
            <Text className="text-red-600 text-sm">{error}</Text>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <Text className="text-yellow-800 text-xs">
              ⚠️ Por segurança, o contato só é revelado após clicar no botão. 
              É proibida a venda de animais - este é um serviço gratuito de adoção.
            </Text>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <Text className="font-medium text-green-800 mb-2">
              📞 Informações de Contato
            </Text>
            
            {contactName && (
              <Text className="text-green-700 mb-1">
                <strong>Nome:</strong> {contactName}
              </Text>
            )}
            
            {contactEmail && (
              <Text className="text-green-700 mb-1">
                <strong>Email:</strong>{" "}
                <a 
                  href={`mailto:${contactEmail}`}
                  className="underline hover:no-underline"
                >
                  {contactEmail}
                </a>
              </Text>
            )}
            
            {contactPhone && (
              <Text className="text-green-700">
                <strong>Telefone:</strong>{" "}
                <a 
                  href={`tel:${contactPhone}`}
                  className="underline hover:no-underline"
                >
                  {contactPhone}
                </a>
              </Text>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <Text className="text-blue-800 text-xs">
              💡 <strong>Dica:</strong> Entre em contato o quanto antes! 
              Pets em adoção costumam ser adotados rapidamente.
            </Text>
          </div>
        </div>
      )}
    </div>
  )
}
