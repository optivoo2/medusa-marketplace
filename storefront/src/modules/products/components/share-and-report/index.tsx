"use client"

import { HttpTypes } from "@medusajs/types"
import { sdk } from "@lib/config"
import { Button, Text } from "@medusajs/ui"
import { useCallback, useMemo, useState } from "react"
import ReportModal from "@modules/pets/components/report-modal"

export default function ShareAndReport({
  product,
}: {
  product: HttpTypes.StoreProduct
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showReportModal, setShowReportModal] = useState(false)

  const highlightUntil = useMemo(() => {
    const until = (product.metadata as any)?.highlight_until
    const d = until ? new Date(until as any) : null
    return d
  }, [product.metadata])

  const timeLeftDays = useMemo(() => {
    if (!highlightUntil) return null
    const now = new Date()
    const diff = Math.ceil((highlightUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }, [highlightUntil])

  const urgencyColor = useMemo(() => {
    if (timeLeftDays === null) return "text-ui-fg-muted"
    if (timeLeftDays > 20) return "text-green-600"
    if (timeLeftDays > 10) return "text-yellow-600"
    return "text-red-600"
  }, [timeLeftDays])

  const productUrl = typeof window !== "undefined" ? window.location.href : ""
  const shareText = `Ajude este pet a ser adotado: ${product.title}`

  const shareWhatsApp = useCallback(() => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText + " " + productUrl)}`
    window.open(url, "_blank")
  }, [productUrl, shareText])

  const shareFacebook = useCallback(() => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`
    window.open(url, "_blank")
  }, [productUrl])

  const shareTwitter = useCallback(() => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(productUrl)}`
    window.open(url, "_blank")
  }, [productUrl, shareText])

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(productUrl)
      setSuccess("Link copiado!")
      setError(null)
    } catch (e: any) {
      setError("Não foi possível copiar o link")
      setSuccess(null)
    }
  }, [productUrl])

  const report = useCallback(() => {
    setShowReportModal(true)
  }, [])

  return (
    <div className="flex flex-col gap-y-3">
      {timeLeftDays !== null && (
        <Text className={urgencyColor}>
          Destaque por {Math.max(timeLeftDays, 0)} dia(s) restantes
        </Text>
      )}
      <div className="flex gap-x-2">
        <Button variant="secondary" onClick={shareWhatsApp}>Compartilhar no WhatsApp</Button>
        <Button variant="secondary" onClick={shareFacebook}>Facebook</Button>
        <Button variant="secondary" onClick={shareTwitter}>X</Button>
        <Button variant="secondary" onClick={copyLink}>Copiar link</Button>
      </div>
      <div>
        <Button variant="danger" onClick={report} isLoading={isSubmitting}>Denunciar</Button>
      </div>
      {error && <Text className="text-red-600">{error}</Text>}
      {success && <Text className="text-green-600">{success}</Text>}
      <Text className="text-ui-fg-muted text-xs">
        É proibida a venda de animais. Anúncios que indiquem cobrança serão removidos.
      </Text>
      
      <ReportModal
        pet={product}
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />
    </div>
  )
}


