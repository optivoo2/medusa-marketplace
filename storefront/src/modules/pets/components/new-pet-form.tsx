"use client"

import { useState } from "react"
import { Button, Input, Textarea, Select, Heading } from "@medusajs/ui"

interface PetFormData {
  title: string
  description: string
  imageUrl: string
  species: string
  breed: string
  age: string
  size: string
  sex: string
  health: string
  temperament: string
  special_needs: string
  rescue_story: string
  city: string
  state: string
  neighborhood: string
  contact_email: string
  contact_phone: string
  contact_name: string
}

export default function NewPetForm() {
  const [formData, setFormData] = useState<PetFormData>({
    title: "",
    description: "",
    imageUrl: "",
    species: "",
    breed: "",
    age: "",
    size: "",
    sex: "",
    health: "",
    temperament: "",
    special_needs: "",
    rescue_story: "",
    city: "",
    state: "",
    neighborhood: "",
    contact_email: "",
    contact_phone: "",
    contact_name: ""
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const brazilianStates = [
    { value: "AC", label: "Acre" },
    { value: "AL", label: "Alagoas" },
    { value: "AP", label: "Amapá" },
    { value: "AM", label: "Amazonas" },
    { value: "BA", label: "Bahia" },
    { value: "CE", label: "Ceará" },
    { value: "DF", label: "Distrito Federal" },
    { value: "ES", label: "Espírito Santo" },
    { value: "GO", label: "Goiás" },
    { value: "MA", label: "Maranhão" },
    { value: "MT", label: "Mato Grosso" },
    { value: "MS", label: "Mato Grosso do Sul" },
    { value: "MG", label: "Minas Gerais" },
    { value: "PA", label: "Pará" },
    { value: "PB", label: "Paraíba" },
    { value: "PR", label: "Paraná" },
    { value: "PE", label: "Pernambuco" },
    { value: "PI", label: "Piauí" },
    { value: "RJ", label: "Rio de Janeiro" },
    { value: "RN", label: "Rio Grande do Norte" },
    { value: "RS", label: "Rio Grande do Sul" },
    { value: "RO", label: "Rondônia" },
    { value: "RR", label: "Roraima" },
    { value: "SC", label: "Santa Catarina" },
    { value: "SP", label: "São Paulo" },
    { value: "SE", label: "Sergipe" },
    { value: "TO", label: "Tocantins" }
  ]

  const speciesOptions = [
    { value: "cao", label: "Cão" },
    { value: "gato", label: "Gato" },
    { value: "coelho", label: "Coelho" },
    { value: "hamster", label: "Hamster" },
    { value: "passaro", label: "Pássaro" },
    { value: "peixe", label: "Peixe" },
    { value: "outros", label: "Outros" }
  ]

  const ageOptions = [
    { value: "filhote", label: "Filhote (até 1 ano)" },
    { value: "jovem", label: "Jovem (1-3 anos)" },
    { value: "adulto", label: "Adulto (3-7 anos)" },
    { value: "idoso", label: "Idoso (7+ anos)" }
  ]

  const sizeOptions = [
    { value: "pequeno", label: "Pequeno" },
    { value: "medio", label: "Médio" },
    { value: "grande", label: "Grande" }
  ]

  const sexOptions = [
    { value: "macho", label: "Macho" },
    { value: "femea", label: "Fêmea" }
  ]

  const handleInputChange = (field: keyof PetFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const resp = await fetch(`/store/products`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...formData,
          images: formData.imageUrl ? [formData.imageUrl] : [],
          tags: [
            { value: "adocao" },
            { value: formData.species },
            { value: formData.age },
            { value: formData.size },
            { value: formData.sex },
            { value: formData.state.toLowerCase() },
            { value: formData.city.toLowerCase() }
          ].filter(tag => tag.value)
        }),
      })

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}))
        throw new Error(data?.error || "Erro ao criar anúncio")
      }

      const result = await resp.json()
      setSuccess("Pet cadastrado para adoção com sucesso!")
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        imageUrl: "",
        species: "",
        breed: "",
        age: "",
        size: "",
        sex: "",
        health: "",
        temperament: "",
        special_needs: "",
        rescue_story: "",
        city: "",
        state: "",
        neighborhood: "",
        contact_email: "",
        contact_phone: "",
        contact_name: ""
      })
    } catch (e: any) {
      setError(e.message || "Erro ao criar anúncio")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Heading level="h1" className="text-2xl font-bold mb-2">
          Cadastrar Pet para Adoção
        </Heading>
        <p className="text-ui-fg-muted">
          Preencha as informações do animal para publicar no PetRescue Brasil
        </p>
      </div>

      <form onSubmit={submit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <Heading level="h2" className="text-lg font-semibold">
            Informações Básicas
          </Heading>
          
          <Input 
            placeholder="Nome do pet (ex: Luna, Max, etc.)" 
            value={formData.title} 
            onChange={(e) => handleInputChange("title", e.target.value)} 
            required 
          />
          
          <Textarea 
            placeholder="Descrição do pet, personalidade, etc." 
            value={formData.description} 
            onChange={(e) => handleInputChange("description", e.target.value)}
            rows={3}
          />
          
          <Input 
            placeholder="URL da imagem (temporário)" 
            value={formData.imageUrl} 
            onChange={(e) => handleInputChange("imageUrl", e.target.value)} 
          />
        </div>

        {/* Pet Characteristics */}
        <div className="space-y-4">
          <Heading level="h2" className="text-lg font-semibold">
            Características do Pet
          </Heading>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              value={formData.species}
              onValueChange={(value) => handleInputChange("species", value)}
              required
            >
              <Select.Trigger>
                <Select.Value placeholder="Espécie" />
              </Select.Trigger>
              <Select.Content>
                {speciesOptions.map(option => (
                  <Select.Item key={option.value} value={option.value}>
                    {option.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>

            <Input 
              placeholder="Raça (opcional)" 
              value={formData.breed} 
              onChange={(e) => handleInputChange("breed", e.target.value)} 
            />

            <Select
              value={formData.age}
              onValueChange={(value) => handleInputChange("age", value)}
              required
            >
              <Select.Trigger>
                <Select.Value placeholder="Idade" />
              </Select.Trigger>
              <Select.Content>
                {ageOptions.map(option => (
                  <Select.Item key={option.value} value={option.value}>
                    {option.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>

            <Select
              value={formData.size}
              onValueChange={(value) => handleInputChange("size", value)}
              required
            >
              <Select.Trigger>
                <Select.Value placeholder="Porte" />
              </Select.Trigger>
              <Select.Content>
                {sizeOptions.map(option => (
                  <Select.Item key={option.value} value={option.value}>
                    {option.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>

            <Select
              value={formData.sex}
              onValueChange={(value) => handleInputChange("sex", value)}
              required
            >
              <Select.Trigger>
                <Select.Value placeholder="Sexo" />
              </Select.Trigger>
              <Select.Content>
                {sexOptions.map(option => (
                  <Select.Item key={option.value} value={option.value}>
                    {option.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
        </div>

        {/* Health & Behavior */}
        <div className="space-y-4">
          <Heading level="h2" className="text-lg font-semibold">
            Saúde e Comportamento
          </Heading>
          
          <Textarea 
            placeholder="Estado de saúde, vacinas, castração, etc." 
            value={formData.health} 
            onChange={(e) => handleInputChange("health", e.target.value)}
            rows={2}
          />
          
          <Textarea 
            placeholder="Temperamento, personalidade, etc." 
            value={formData.temperament} 
            onChange={(e) => handleInputChange("temperament", e.target.value)}
            rows={2}
          />
          
          <Textarea 
            placeholder="Necessidades especiais (opcional)" 
            value={formData.special_needs} 
            onChange={(e) => handleInputChange("special_needs", e.target.value)}
            rows={2}
          />
          
          <Textarea 
            placeholder="História do resgate (opcional)" 
            value={formData.rescue_story} 
            onChange={(e) => handleInputChange("rescue_story", e.target.value)}
            rows={2}
          />
        </div>

        {/* Location */}
        <div className="space-y-4">
          <Heading level="h2" className="text-lg font-semibold">
            Localização
          </Heading>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              value={formData.state}
              onValueChange={(value) => handleInputChange("state", value)}
              required
            >
              <Select.Trigger>
                <Select.Value placeholder="Estado" />
              </Select.Trigger>
              <Select.Content>
                {brazilianStates.map(state => (
                  <Select.Item key={state.value} value={state.value}>
                    {state.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>

            <Input 
              placeholder="Cidade" 
              value={formData.city} 
              onChange={(e) => handleInputChange("city", e.target.value)} 
              required
            />

            <Input 
              placeholder="Bairro (opcional)" 
              value={formData.neighborhood} 
              onChange={(e) => handleInputChange("neighborhood", e.target.value)} 
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <Heading level="h2" className="text-lg font-semibold">
            Informações de Contato
          </Heading>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              type="email"
              placeholder="Email de contato" 
              value={formData.contact_email} 
              onChange={(e) => handleInputChange("contact_email", e.target.value)} 
              required
            />
            
            <Input 
              placeholder="Telefone (opcional)" 
              value={formData.contact_phone} 
              onChange={(e) => handleInputChange("contact_phone", e.target.value)} 
            />

            <Input 
              placeholder="Seu nome (opcional)" 
              value={formData.contact_name} 
              onChange={(e) => handleInputChange("contact_name", e.target.value)} 
            />
          </div>
        </div>

        {/* Submit */}
        <div className="space-y-4">
          <Button 
            type="submit" 
            isLoading={isSubmitting} 
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Publicando..." : "Publicar Pet para Adoção"}
          </Button>
          
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}
          
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-800 text-sm font-medium">
              ⚠️ Importante: É proibida a venda de animais. Este é um serviço gratuito de adoção.
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}


