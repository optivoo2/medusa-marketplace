"use client"

import { Button, Input, Select, Text } from "@medusajs/ui"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useMemo } from "react"

type PetFiltersProps = {
  currentFilters: {
    species?: string
    city?: string
    state?: string
    age?: string
    size?: string
    sex?: string
    search?: string
  }
  countryCode: string
}

export default function PetFilters({ currentFilters, countryCode }: PetFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    
    router.push(`/${countryCode}/pets?${params.toString()}`)
  }, [router, searchParams, countryCode])

  const clearFilters = useCallback(() => {
    router.push(`/${countryCode}/pets`)
  }, [router, countryCode])

  const hasActiveFilters = useMemo(() => {
    return Object.values(currentFilters).some(Boolean)
  }, [currentFilters])

  const speciesOptions = [
    { value: "", label: "Todas as espécies" },
    { value: "cao", label: "Cão" },
    { value: "gato", label: "Gato" },
    { value: "coelho", label: "Coelho" },
    { value: "hamster", label: "Hamster" },
    { value: "passaro", label: "Pássaro" },
    { value: "peixe", label: "Peixe" },
    { value: "outros", label: "Outros" }
  ]

  const ageOptions = [
    { value: "", label: "Todas as idades" },
    { value: "filhote", label: "Filhote (até 1 ano)" },
    { value: "jovem", label: "Jovem (1-3 anos)" },
    { value: "adulto", label: "Adulto (3-7 anos)" },
    { value: "idoso", label: "Idoso (7+ anos)" }
  ]

  const sizeOptions = [
    { value: "", label: "Todos os portes" },
    { value: "pequeno", label: "Pequeno" },
    { value: "medio", label: "Médio" },
    { value: "grande", label: "Grande" }
  ]

  const sexOptions = [
    { value: "", label: "Qualquer sexo" },
    { value: "macho", label: "Macho" },
    { value: "femea", label: "Fêmea" }
  ]

  const brazilianStates = [
    { value: "", label: "Todos os estados" },
    { value: "SP", label: "São Paulo" },
    { value: "RJ", label: "Rio de Janeiro" },
    { value: "MG", label: "Minas Gerais" },
    { value: "RS", label: "Rio Grande do Sul" },
    { value: "PR", label: "Paraná" },
    { value: "SC", label: "Santa Catarina" },
    { value: "BA", label: "Bahia" },
    { value: "GO", label: "Goiás" },
    { value: "PE", label: "Pernambuco" },
    { value: "CE", label: "Ceará" },
    { value: "PA", label: "Pará" },
    { value: "MA", label: "Maranhão" },
    { value: "MT", label: "Mato Grosso" },
    { value: "MS", label: "Mato Grosso do Sul" },
    { value: "ES", label: "Espírito Santo" },
    { value: "PB", label: "Paraíba" },
    { value: "RN", label: "Rio Grande do Norte" },
    { value: "AL", label: "Alagoas" },
    { value: "SE", label: "Sergipe" },
    { value: "RO", label: "Rondônia" },
    { value: "AC", label: "Acre" },
    { value: "AM", label: "Amazonas" },
    { value: "RR", label: "Roraima" },
    { value: "AP", label: "Amapá" },
    { value: "TO", label: "Tocantins" },
    { value: "PI", label: "Piauí" },
    { value: "DF", label: "Distrito Federal" }
  ]

  return (
    <div className="bg-ui-bg-subtle rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Text className="font-semibold">Filtros</Text>
        {hasActiveFilters && (
          <Button
            variant="secondary"
            size="small"
            onClick={clearFilters}
          >
            Limpar filtros
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <Input
            placeholder="Buscar por nome, raça, cidade..."
            value={currentFilters.search || ""}
            onChange={(e) => updateFilter("search", e.target.value)}
          />
        </div>

        {/* Species */}
        <Select
          value={currentFilters.species || ""}
          onValueChange={(value) => updateFilter("species", value)}
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

        {/* State */}
        <Select
          value={currentFilters.state || ""}
          onValueChange={(value) => updateFilter("state", value)}
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

        {/* City */}
        <Input
          placeholder="Cidade"
          value={currentFilters.city || ""}
          onChange={(e) => updateFilter("city", e.target.value)}
        />

        {/* Age */}
        <Select
          value={currentFilters.age || ""}
          onValueChange={(value) => updateFilter("age", value)}
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

        {/* Size */}
        <Select
          value={currentFilters.size || ""}
          onValueChange={(value) => updateFilter("size", value)}
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

        {/* Sex */}
        <Select
          value={currentFilters.sex || ""}
          onValueChange={(value) => updateFilter("sex", value)}
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
  )
}
