import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

// POST /store/products - create product for adoption (Enhanced MVP form)
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const productModule = req.scope.resolve(Modules.PRODUCT)
    const {
      title,
      description,
      images = [],
      metadata = {},
      tags = [],
      categories = [],
      // Pet-specific fields (all required for Brazilian market)
      species,
      breed,
      age,
      size,
      sex,
      health,
      temperament,
      special_needs,
      rescue_story,
      city,
      state,
      neighborhood,
      contact_email,
      contact_phone,
      contact_name,
    } = (req.body || {}) as any

    // Validation for required fields
    const requiredFields = {
      title: "Título é obrigatório",
      species: "Espécie é obrigatória",
      age: "Idade é obrigatória", 
      size: "Porte é obrigatório",
      sex: "Sexo é obrigatório",
      city: "Cidade é obrigatória",
      state: "Estado é obrigatório",
      contact_email: "Email de contato é obrigatório"
    }

    for (const [field, message] of Object.entries(requiredFields)) {
      const body: any = req.body as any
      if (!body[field]) {
        return res.status(400).json({ error: message })
      }
    }

    // Validate Brazilian state
    const validStates = [
      'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
      'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
      'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
    ]
    
    if (!validStates.includes(state.toUpperCase())) {
      return res.status(400).json({ error: "Estado inválido" })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(contact_email)) {
      return res.status(400).json({ error: "Email de contato inválido" })
    }

    // Find adoption category
    const adoptionCategory = await productModule.listProductCategories({
      handle: "adocao",
    })

    if (!adoptionCategory.length) {
      return res.status(500).json({ error: "Categoria de adoção não encontrada. Execute o seed script primeiro." })
    }

    // Calculate 30-day highlight period
    const now = new Date()
    const highlightUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    // Create comprehensive pet metadata
    const petMetadata = {
      ...metadata,
      // Core adoption flags
      adoption: true,
      highlight_until: highlightUntil.toISOString(),
      reported_count: 0,
      created_at: now.toISOString(),
      
      // Pet characteristics
      species: species.toLowerCase(),
      breed: breed?.toLowerCase() || '',
      age: age.toLowerCase(),
      size: size.toLowerCase(),
      sex: sex.toLowerCase(),
      
      // Health and behavior
      health: health || '',
      temperament: temperament || '',
      special_needs: special_needs || '',
      rescue_story: rescue_story || '',
      
      // Location (Brazilian specific)
      city: city.toLowerCase(),
      state: state.toUpperCase(),
      neighborhood: neighborhood?.toLowerCase() || '',
      country: 'BR',
      
      // Contact information (will be protected)
      contact_email: contact_email.toLowerCase(),
      contact_phone: contact_phone || '',
      contact_name: contact_name || '',
      
      // Search optimization
      searchable_text: `${title} ${description} ${species} ${breed} ${city} ${state}`.toLowerCase(),
    }

    const [product] = await productModule.createProducts([
      {
        title,
        description,
        images: images.map((url: string) => ({ url })),
        // Single variant for adoption (not purchasable)
        variants: [
          {
            title: "Adoção",
            options: {},
            manage_inventory: false,
            allow_backorder: false,
            // No pricing - adoption is free
          },
        ],
        // @ts-expect-error: tags not in types but works in runtime
        tags: [
          { value: "adocao" },
          { value: species.toLowerCase() },
          ...(breed ? [{ value: breed.toLowerCase() }] : []),
          { value: age.toLowerCase() },
          { value: size.toLowerCase() },
          { value: city.toLowerCase() },
          { value: state.toLowerCase() },
          ...tags
        ].filter(Boolean),
        categories: [adoptionCategory[0].id, ...categories],
        metadata: petMetadata,
        // Ensure product is published and visible
        status: "published",
      },
    ])

    res.status(201).json({ 
      product,
      message: "Pet cadastrado para adoção com sucesso!",
      highlight_until: highlightUntil.toISOString()
    })
  } catch (e: any) {
    console.error('Pet creation error:', e)
    res.status(500).json({ 
      error: "Erro interno do servidor",
      details: e.message 
    })
  }
}


