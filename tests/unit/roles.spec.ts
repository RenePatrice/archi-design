import type { PayloadRequest } from 'payload'
import { describe, expect, it } from 'vitest'

import { isAdmin, isStaff, isStaffOrSelf } from '@/access/roles'

/** Fabrique une requête Payload minimale avec l'utilisateur voulu. */
const reqWith = (user: { id: number; role: string } | null) =>
  ({ req: { user } as unknown as PayloadRequest }) as Parameters<typeof isAdmin>[0]

describe('contrôle d’accès par rôle', () => {
  it('réserve isAdmin aux administrateurs', () => {
    expect(isAdmin(reqWith({ id: 1, role: 'admin' }))).toBe(true)
    expect(isAdmin(reqWith({ id: 2, role: 'equipe' }))).toBe(false)
    expect(isAdmin(reqWith(null))).toBe(false)
  })

  it('ouvre isStaff à l’admin et à l’équipe, pas aux clients', () => {
    expect(isStaff(reqWith({ id: 1, role: 'admin' }))).toBe(true)
    expect(isStaff(reqWith({ id: 2, role: 'equipe' }))).toBe(true)
    expect(isStaff(reqWith({ id: 3, role: 'client' }))).toBe(false)
  })

  it('limite un client à son propre compte', () => {
    expect(isStaffOrSelf(reqWith({ id: 2, role: 'equipe' }))).toBe(true)
    expect(isStaffOrSelf(reqWith({ id: 7, role: 'client' }))).toEqual({ id: { equals: 7 } })
    expect(isStaffOrSelf(reqWith(null))).toBe(false)
  })
})
