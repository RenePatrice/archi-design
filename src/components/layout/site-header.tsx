import { UserRound } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { CartButton } from '@/components/shop/cart-button'
import { buttonVariants } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { mainNav } from '@/lib/navigation'
import { cn } from '@/lib/utils'

import { HeaderShell } from './header-shell'
import { LanguageSwitcher } from './language-switcher'
import { MobileMenu } from './mobile-menu'
import { ThemeToggle } from './theme-toggle'
import { Wordmark } from './wordmark'

/** En-tête collant : marque, menu, langue, thème et appel à l'action. Transparent sur l'accueil. */
export async function SiteHeader() {
  const t = await getTranslations('Nav')
  const common = await getTranslations('Common')

  return (
    <HeaderShell>
      <div className="container-site flex h-20 items-center justify-between gap-4">
        <Link href="/" aria-label={t('home')} className="flex min-h-11 items-center">
          <Wordmark />
        </Link>

        <nav aria-label={t('label')} className="hidden lg:block">
          <ul className="flex items-center gap-7 text-[0.6875rem] font-semibold tracking-[0.2em] uppercase">
            {mainNav.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className="relative inline-flex min-h-11 items-center after:absolute after:bottom-2.5 after:left-0 after:h-px after:w-0 after:bg-accent after:transition-[width] after:duration-300 hover:after:w-full"
                >
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <LanguageSwitcher className="hidden lg:flex" />
          <ThemeToggle />
          <CartButton />
          {/* Sur téléphone, l'espace client est dans le menu (place limitée dans l'en-tête) */}
          <Link
            href="/espace-client"
            aria-label={t('clientArea')}
            title={t('clientArea')}
            className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'hidden sm:inline-flex')}
          >
            <UserRound aria-hidden />
          </Link>
          <Link href="/devis" className={cn(buttonVariants({ size: 'sm' }), 'ml-2 hidden sm:inline-flex')}>
            {common('requestQuote')}
          </Link>
          <MobileMenu />
        </div>
      </div>
    </HeaderShell>
  )
}
