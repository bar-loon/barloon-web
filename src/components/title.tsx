import Head from 'next/head'

export default ({ title = '' }) => (
  <Head>
    <title>
      {title}
      {title && ' | '}Barloon
    </title>
    <meta property="og:title" content={title} />
  </Head>
)
