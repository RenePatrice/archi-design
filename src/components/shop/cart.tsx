'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

/** Ce que le panier garde d'un produit pour l'afficher ; le prix est recalculé par le serveur à la commande. */
export type CartItem = {
  id: number
  slug: string
  name: string
  reference: string
  price: number
  unit: string
  image?: string | null
  quantity: number
}

type CartContextValue = {
  items: CartItem[]
  count: number
  total: number
  ready: boolean
  add: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  setQuantity: (id: number, quantity: number) => void
  remove: (id: number) => void
  clear: () => void
}

const STORAGE_KEY = 'archi-design:panier'
const CartContext = createContext<CartContextValue | null>(null)

/**
 * Panier enregistré sur l'appareil (localStorage) : il survit au rechargement de la page,
 * à une coupure réseau et à la fermeture du navigateur.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as CartItem[]
      // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture unique du stockage local au montage
      if (Array.isArray(stored)) setItems(stored.filter((i) => i && Number.isInteger(i.id) && i.quantity > 0))
    } catch {}
    setReady(true)

    // Synchronise les onglets ouverts en même temps
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return
      try {
        setItems(JSON.parse(e.newValue ?? '[]'))
      } catch {}
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const persist = useCallback((next: CartItem[]) => {
    setItems(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {}
  }, [])

  const value = useMemo<CartContextValue>(() => {
    const clamp = (n: number) => Math.min(Math.max(Math.floor(n) || 1, 1), 9999)
    return {
      items,
      ready,
      count: items.reduce((sum, i) => sum + i.quantity, 0),
      total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      add: (item, quantity = 1) => {
        const existing = items.find((i) => i.id === item.id)
        persist(
          existing
            ? items.map((i) => (i.id === item.id ? { ...i, ...item, quantity: clamp(i.quantity + quantity) } : i))
            : [...items, { ...item, quantity: clamp(quantity) }],
        )
      },
      setQuantity: (id, quantity) => persist(items.map((i) => (i.id === id ? { ...i, quantity: clamp(quantity) } : i))),
      remove: (id) => persist(items.filter((i) => i.id !== id)),
      clear: () => persist([]),
    }
  }, [items, ready, persist])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart doit être utilisé dans <CartProvider>')
  return context
}
