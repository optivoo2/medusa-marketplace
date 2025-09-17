import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: {
    default: "PetRescue Brasil - Pets para Adoção",
    template: "%s | PetRescue Brasil"
  },
  description: "Encontre seu novo melhor amigo. Pets resgatados esperando por um lar amoroso. Adoção gratuita em São Paulo, Rio de Janeiro e Belo Horizonte.",
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-mode="light">
      <body>
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
