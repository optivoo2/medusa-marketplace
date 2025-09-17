"use client"

import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import { Share2, MessageCircle, Instagram, Facebook, Twitter, Copy } from "lucide-react"
import { useState, useEffect } from "react"

type SocialShareProps = {
  pet: HttpTypes.StoreProduct
  countryCode: string
}

export default function SocialShare({ pet, countryCode }: SocialShareProps) {
  const [copied, setCopied] = useState(false)
  const [petUrl, setPetUrl] = useState('')
  const metadata = pet.metadata as any

  const shareText = `Conheça ${pet.title}, um ${metadata?.species || 'pet'} ${metadata?.age || ''} ${metadata?.size || ''} em ${metadata?.city || ''}, ${metadata?.state || ''}. Adoção gratuita! 🐾`
  const hashtags = "#PetRescueBrasil #AdoçãoGratuita #PetParaAdoção"

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPetUrl(`${window.location.origin}/${countryCode}/pets/${pet.id}`)
    }
  }, [countryCode, pet.id])

  const shareToWhatsApp = () => {
    const message = `${shareText}\n\n${petUrl}`
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  const shareToInstagram = () => {
    // Instagram não permite compartilhamento direto via URL
    // Vamos copiar o texto para o usuário colar no Instagram
    const message = `${shareText}\n\n${petUrl}\n\n${hashtags}`
    navigator.clipboard.writeText(message)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(petUrl)}&quote=${encodeURIComponent(shareText)}`
    window.open(url, '_blank', 'width=600,height=400')
  }

  const shareToTwitter = () => {
    const message = `${shareText} ${hashtags}`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(petUrl)}`
    window.open(url, '_blank', 'width=600,height=400')
  }

  const copyLink = () => {
    navigator.clipboard.writeText(petUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareViaWebAPI = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${pet.title} - Pet para Adoção`,
          text: shareText,
          url: petUrl,
        })
      } catch (err) {
        console.log('Erro ao compartilhar:', err)
      }
    } else {
      // Fallback para navegadores que não suportam Web Share API
      copyLink()
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Share2 className="w-4 h-4" />
        <span className="text-sm font-medium">Compartilhar:</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {/* WhatsApp */}
        <Button
          variant="secondary"
          size="small"
          onClick={shareToWhatsApp}
          className="flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </Button>

        {/* Instagram */}
        <Button
          variant="secondary"
          size="small"
          onClick={shareToInstagram}
          className="flex items-center gap-2 bg-pink-50 hover:bg-pink-100 text-pink-700 border-pink-200"
        >
          <Instagram className="w-4 h-4" />
          Instagram
        </Button>

        {/* Facebook */}
        <Button
          variant="secondary"
          size="small"
          onClick={shareToFacebook}
          className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
        >
          <Facebook className="w-4 h-4" />
          Facebook
        </Button>

        {/* Twitter/X */}
        <Button
          variant="secondary"
          size="small"
          onClick={shareToTwitter}
          className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
        >
          <Twitter className="w-4 h-4" />
          X/Twitter
        </Button>

        {/* Copiar Link */}
        <Button
          variant="secondary"
          size="small"
          onClick={copyLink}
          className="flex items-center gap-2"
        >
          <Copy className="w-4 h-4" />
          {copied ? 'Copiado!' : 'Copiar Link'}
        </Button>

        {/* Compartilhamento Nativo (Mobile) */}
        {navigator.share && (
          <Button
            variant="secondary"
            size="small"
            onClick={shareViaWebAPI}
            className="flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Compartilhar
          </Button>
        )}
      </div>

      {copied && (
        <div className="text-sm text-green-600 font-medium">
          ✅ Link copiado! Cole no Instagram ou onde quiser compartilhar.
        </div>
      )}
    </div>
  )
}
