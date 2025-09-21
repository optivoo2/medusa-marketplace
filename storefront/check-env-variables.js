function checkEnvVariables() {
  const requiredEnvVars = [
    {
      name: "NEXT_PUBLIC_MEDUSA_BACKEND_URL",
      description: "URL do backend Medusa (ex: https://petrescue-brasil-production.up.railway.app)",
      example: "https://petrescue-brasil-production.up.railway.app"
    },
    {
      name: "MEDUSA_BACKEND_URL",
      description: "URL do backend Medusa para uso no servidor (ex: https://petrescue-brasil-production.up.railway.app)",
      example: "https://petrescue-brasil-production.up.railway.app"
    },
    {
      name: "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY",
      description: "Chave pública da API do Medusa",
      example: "pk_cdfa13cc05867abb45cdbf9f5985057ee9a4d48a6117a7a9f556c0d064ac0af1"
    },
    {
      name: "NEXT_PUBLIC_DEFAULT_REGION",
      description: "Região padrão (ex: br)",
      example: "br"
    }
  ]

  const optionalEnvVars = [
    {
      name: "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME",
      description: "Nome da conta do Cloudinary para uploads de imagem",
      example: "petrescue"
    },
    {
      name: "NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET",
      description: "Preset de upload do Cloudinary",
      example: "petrescue_unsigned"
    }
  ]

  function checkEnvVar(envVar) {
    const value = process.env[envVar.name]
    const isSet = value && value.trim() !== ""

    if (isSet) {
      console.log(`✅ ${envVar.name}: ${value}`)
    } else {
      console.log(`❌ ${envVar.name}: Not set`)
      console.log(`   Description: ${envVar.description}`)
      console.log(`   Example: ${envVar.example}`)
    }

    return isSet
  }

  console.log("🔍 Checking environment variables...\n")

  let allRequiredSet = true

  console.log("📋 Required variables:")
  requiredEnvVars.forEach(envVar => {
    const isSet = checkEnvVar(envVar)
    if (!isSet) {
      allRequiredSet = false
    }
  })

  console.log("\n📋 Optional variables:")
  optionalEnvVars.forEach(envVar => {
    checkEnvVar(envVar)
  })

  console.log("\n" + "=".repeat(50))

  if (!allRequiredSet) {
    console.log("❌ Some required environment variables are missing!")
    console.log("Please set them in your Vercel dashboard or .env file.")
    process.exit(1)
  } else {
    console.log("✅ All required environment variables are set!")
  }

  return allRequiredSet
}

module.exports = checkEnvVariables