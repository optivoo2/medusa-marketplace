import { Metadata } from "next"

import InteractiveLink from "@modules/common/components/interactive-link"

export const metadata: Metadata = {
  title: "404",
  description: "Carrinho não encontrado",
}

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
      <h1 className="text-2xl-semi text-ui-fg-base">Lista não encontrada</h1>
      <p className="text-small-regular text-ui-fg-base">
        Não encontramos esta lista de interesse. Limpe o cache do navegador e tente novamente.
      </p>
      <InteractiveLink href="/">Ir para a página inicial</InteractiveLink>
    </div>
  )
}
