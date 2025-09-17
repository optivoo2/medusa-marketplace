import { MedusaApp } from "@medusajs/framework/utils"

/**
 * Seed script for PetRescue Brasil MVP
 * Sets up adoption category, Brazilian states, and initial data
 */
async function seedPetRescue() {
  const { Modules } = await import("@medusajs/framework/utils")
  
  const app = await MedusaApp({ 
    workingDirectory: process.cwd(),
    configModule: require("../../medusa-config")
  })

  const productModule = app.container.resolve(Modules.PRODUCT)
  const regionModule = app.container.resolve(Modules.REGION)

  console.log("🌱 Starting PetRescue Brasil seed...")

  try {
    // 1. Create Adoption Category
    console.log("📂 Creating adoption category...")
    
    const existingCategory = await productModule.listProductCategories({
      handle: "adocao"
    })

    if (existingCategory.length === 0) {
      const [adoptionCategory] = await productModule.createProductCategories([
        {
          name: "Adoção de Animais",
          handle: "adocao",
          description: "Animais disponíveis para adoção gratuita",
          is_active: true,
          is_internal: false,
          metadata: {
            type: "adoption",
            country: "BR",
            language: "pt-BR"
          }
        }
      ])
      console.log("✅ Adoption category created:", adoptionCategory.id)
    } else {
      console.log("✅ Adoption category already exists")
    }

    // 2. Create Brazilian States as Tags (for filtering)
    console.log("🏛️ Creating Brazilian states...")
    
    const brazilianStates = [
      { name: "Acre", code: "AC" },
      { name: "Alagoas", code: "AL" },
      { name: "Amapá", code: "AP" },
      { name: "Amazonas", code: "AM" },
      { name: "Bahia", code: "BA" },
      { name: "Ceará", code: "CE" },
      { name: "Distrito Federal", code: "DF" },
      { name: "Espírito Santo", code: "ES" },
      { name: "Goiás", code: "GO" },
      { name: "Maranhão", code: "MA" },
      { name: "Mato Grosso", code: "MT" },
      { name: "Mato Grosso do Sul", code: "MS" },
      { name: "Minas Gerais", code: "MG" },
      { name: "Pará", code: "PA" },
      { name: "Paraíba", code: "PB" },
      { name: "Paraná", code: "PR" },
      { name: "Pernambuco", code: "PE" },
      { name: "Piauí", code: "PI" },
      { name: "Rio de Janeiro", code: "RJ" },
      { name: "Rio Grande do Norte", code: "RN" },
      { name: "Rio Grande do Sul", code: "RS" },
      { name: "Rondônia", code: "RO" },
      { name: "Roraima", code: "RR" },
      { name: "Santa Catarina", code: "SC" },
      { name: "São Paulo", code: "SP" },
      { name: "Sergipe", code: "SE" },
      { name: "Tocantins", code: "TO" }
    ]

    // Create state tags for filtering
    for (const state of brazilianStates) {
      const existingTag = await productModule.listProductTags({
        value: state.code.toLowerCase()
      })
      
      if (existingTag.length === 0) {
        await productModule.createProductTags([
          {
            value: state.code.toLowerCase(),
            metadata: {
              type: "state",
              name: state.name,
              code: state.code,
              country: "BR"
            }
          }
        ])
      }
    }
    console.log("✅ Brazilian states created as tags")

    // 3. Create Pet Species Tags
    console.log("🐕 Creating pet species tags...")
    
    const petSpecies = [
      { name: "Cão", value: "cao" },
      { name: "Gato", value: "gato" },
      { name: "Coelho", value: "coelho" },
      { name: "Hamster", value: "hamster" },
      { name: "Pássaro", value: "passaro" },
      { name: "Peixe", value: "peixe" },
      { name: "Outros", value: "outros" }
    ]

    for (const species of petSpecies) {
      const existingTag = await productModule.listProductTags({
        value: species.value
      })
      
      if (existingTag.length === 0) {
        await productModule.createProductTags([
          {
            value: species.value,
            metadata: {
              type: "species",
              name: species.name,
              country: "BR"
            }
          }
        ])
      }
    }
    console.log("✅ Pet species tags created")

    // 4. Create Age Categories
    console.log("📅 Creating age categories...")
    
    const ageCategories = [
      { name: "Filhote", value: "filhote" },
      { name: "Jovem", value: "jovem" },
      { name: "Adulto", value: "adulto" },
      { name: "Idoso", value: "idoso" }
    ]

    for (const age of ageCategories) {
      const existingTag = await productModule.listProductTags({
        value: age.value
      })
      
      if (existingTag.length === 0) {
        await productModule.createProductTags([
          {
            value: age.value,
            metadata: {
              type: "age",
              name: age.name,
              country: "BR"
            }
          }
        ])
      }
    }
    console.log("✅ Age categories created")

    // 5. Create Size Categories
    console.log("📏 Creating size categories...")
    
    const sizeCategories = [
      { name: "Pequeno", value: "pequeno" },
      { name: "Médio", value: "medio" },
      { name: "Grande", value: "grande" }
    ]

    for (const size of sizeCategories) {
      const existingTag = await productModule.listProductTags({
        value: size.value
      })
      
      if (existingTag.length === 0) {
        await productModule.createProductTags([
          {
            value: size.value,
            metadata: {
              type: "size",
              name: size.name,
              country: "BR"
            }
          }
        ])
      }
    }
    console.log("✅ Size categories created")

    // 6. Create Sex Categories
    console.log("⚥ Creating sex categories...")
    
    const sexCategories = [
      { name: "Macho", value: "macho" },
      { name: "Fêmea", value: "femea" }
    ]

    for (const sex of sexCategories) {
      const existingTag = await productModule.listProductTags({
        value: sex.value
      })
      
      if (existingTag.length === 0) {
        await productModule.createProductTags([
          {
            value: sex.value,
            metadata: {
              type: "sex",
              name: sex.name,
              country: "BR"
            }
          }
        ])
      }
    }
    console.log("✅ Sex categories created")

    // 7. Create sample pet for testing (optional)
    console.log("🐾 Creating sample pet...")
    
    const samplePets = await productModule.listProducts({
      title: "Exemplo - Cão para Adoção"
    })

    if (samplePets.length === 0) {
      const adoptionCategory = await productModule.listProductCategories({
        handle: "adocao"
      })

      const now = new Date()
      const highlightUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

      await productModule.createProducts([
        {
          title: "Exemplo - Cão para Adoção",
          description: "Este é um exemplo de pet cadastrado para adoção. Cão dócil, vacinado e castrado, procurando um lar amoroso.",
          images: [
            { url: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400" }
          ],
          variants: [
            {
              title: "Adoção",
              options: [],
              manage_inventory: false,
              allow_backorder: false,
            },
          ],
          tags: [
            { value: "adocao" },
            { value: "cao" },
            { value: "adulto" },
            { value: "medio" },
            { value: "macho" },
            { value: "sp" },
            { value: "sao paulo" }
          ],
          categories: [adoptionCategory[0].id],
          metadata: {
            adoption: true,
            highlight_until: highlightUntil.toISOString(),
            reported_count: 0,
            created_at: now.toISOString(),
            species: "cao",
            breed: "vira-lata",
            age: "adulto",
            size: "medio",
            sex: "macho",
            health: "Vacinado, castrado, vermifugado",
            temperament: "Dócil, brincalhão, sociável",
            special_needs: "",
            rescue_story: "Resgatado das ruas, já adaptado à vida doméstica",
            city: "sao paulo",
            state: "SP",
            neighborhood: "centro",
            country: "BR",
            contact_email: "exemplo@petrescue.com.br",
            contact_phone: "(11) 99999-9999",
            contact_name: "João Silva",
            searchable_text: "exemplo cão para adoção vira-lata adulto medio macho sao paulo sp"
          },
          status: "published",
        }
      ])
      console.log("✅ Sample pet created")
    } else {
      console.log("✅ Sample pet already exists")
    }

    console.log("🎉 PetRescue Brasil seed completed successfully!")
    console.log("📋 Summary:")
    console.log("   - Adoption category: ✅")
    console.log("   - Brazilian states: ✅")
    console.log("   - Pet species: ✅")
    console.log("   - Age categories: ✅")
    console.log("   - Size categories: ✅")
    console.log("   - Sex categories: ✅")
    console.log("   - Sample pet: ✅")

  } catch (error) {
    console.error("❌ Seed failed:", error)
    throw error
  } finally {
    await app.shutdown()
  }
}

// Run the seed if this file is executed directly
if (require.main === module) {
  seedPetRescue()
    .then(() => {
      console.log("✅ Seed completed")
      process.exit(0)
    })
    .catch((error) => {
      console.error("❌ Seed failed:", error)
      process.exit(1)
    })
}

export default seedPetRescue
