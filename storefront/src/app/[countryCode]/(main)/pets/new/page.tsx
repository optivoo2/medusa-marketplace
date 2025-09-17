import NewPetForm from "@modules/pets/components/new-pet-form"

export const metadata = {
  title: "Novo Anúncio de Adoção",
}

export default function NewPetPage() {
  return (
    <div className="content-container py-10">
      <NewPetForm />
    </div>
  )
}


