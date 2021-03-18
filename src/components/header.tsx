import Link from 'next/link'
import Head from 'next/head'
import Logo from './logo'
import styles from '../styles/header.module.css'

const ogImageUrl = 'https://barloon.jp/og-image.png'

const Header = ({ className }) => {
  return (
    <>
      <Head>
        <meta
          name="description"
          content="Barloonはオンライン活動主体のエンジニアコミュニティです"
        />
        <meta
          property="og:description"
          content="Barloonはオンライン活動主体のエンジニアコミュニティです"
        />
        <meta property="og:site_name" content="Barloon" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={ogImageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={ogImageUrl} />
      </Head>
      <header className={className}>
        <Link href="/">
          <a className={styles.logo}>
            <Logo />
          </a>
        </Link>
      </header>
    </>
  )
}

export default Header
