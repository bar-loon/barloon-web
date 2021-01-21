import Link from 'next/link'
import Head from 'next/head'
import Logo from './logo'
import { useRouter } from 'next/router'
import styles from '../styles/header.module.css'

const navItems: { label: string; page: string; pattern: RegExp }[] = [
  { label: 'About', page: '/about', pattern: /^\/about$/ },
  { label: 'Article', page: '/article', pattern: /^\/article/ },
]

const ogImageUrl = '/og-image.gif'

export default ({ className }) => {
  const { asPath } = useRouter()

  return (
    <>
      <Head>
        <meta
          name="description"
          content="Barloonはオンライン活動主体のエンジニアコミュニティです"
        />
        <meta property="og:title" content="Barloon" />
        <meta property="og:site_name" content="Barloon" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={ogImageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={ogImageUrl} />
      </Head>
      <header className={`${styles.root} ${className}`}>
        <Link href="/">
          <a className={styles.logo}>
            <Logo />
          </a>
        </Link>
        <ul className={styles.navItems}>
          {navItems.map(({ label, page, pattern }) => (
            <li key={label}>
              <Link href={page}>
                <a className={pattern.test(asPath) ? 'is-active' : undefined}>
                  {label}
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </header>
    </>
  )
}
