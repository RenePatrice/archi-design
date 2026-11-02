import { UserRound } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { CartButton } from '@/components/shop/cart-button'
import { buttonVariants } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { mainNav } from '@/lib/navigation'
import { cn } from '@/lib/utils'

import { LanguageSwitcher } from './language-switcher'
import { MobileMenu } from './mobile-menu'
import { ThemeToggle } from './theme-toggle'
import { Wordmark } from './wordmark'

/** En-tête collant : marque, menu, langue, thème et appel à l'action. */
export async function SiteHeader() {
  const t = await getTranslations('Nav')
  const common = await getTranslations('Common')

  return (
    <header className="sticky top-[env(safe-area-inset-top,0px)] z-50 border-b border-line bg-bg/95 backdrop-blur-sm">
      <div className="container-site flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label={t('home')} className="flex min-h-11 items-center">
          <Wordmark />
        </Link>

        <nav aria-label={t('label')} className="hidden lg:block">
          <ul className="flex items-center gap-5 text-sm font-semibold">
            {mainNav.map((item) => (
              <li key={item.key}>
                <Link href={item.href} className="inline-flex min-h-11 items-center hover:text-accent">
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
          <Link href="/devis" className={cn(buttonVariants({ size: 'sm' }), 'hidden sm:inline-flex')}>
            {common('requestQuote')}
          </Link>
          <MobileMenu />
        </div>
      </div>
    </header>
  )
}
