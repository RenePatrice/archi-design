import { notFound } from 'next/navigation'

// Toute URL inconnue affiche la page 404 traduite (et non celle de Next.js par défaut)
export default function CatchAll() {
  notFound()
}
