import Head from 'next/head'

const Title = ({ title = '' }) => (
  <Head>
    <title>
      {title}
      {title && ' | '}Barloon
    </title>
    <meta property="og:title" content={title} />
  </Head>
)

export default Title
