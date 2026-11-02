import { getTranslations } from 'next-intl/server'

import { buttonVariants } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'

/** Page 404, traduite dans la langue de l'URL. */
export default async function NotFound() {
  const t = await getTranslations('NotFound')

  return (
    <section className="container-site flex flex-col items-start gap-5 py-24">
      <p className="eyebrow">404</p>
      <h1 className="text-3xl font-extrabold sm:text-4xl">{t('title')}</h1>
      <p className="text-muted">{t('text')}</p>
      <Link href="/" className={buttonVariants({ variant: 'outline' })}>
        {t('back')}
      </Link>
    </section>
  )
}
