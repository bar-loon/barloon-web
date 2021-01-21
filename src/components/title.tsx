import Head from 'next/head'

export default ({ title = '' }) => (
  <Head>
    <title>
      {title}
      {title && ' | '}Barloon
    </title>
  </Head>
)
