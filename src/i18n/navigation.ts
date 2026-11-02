import { createNavigation } from 'next-intl/navigation'

import { routing } from './routing'

/** Liens et redirections qui conservent automatiquement la langue en cours. */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing)
