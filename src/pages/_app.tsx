import '../styles/global.css'
import 'katex/dist/katex.css'
import Header from '../components/header'
import Footer from '../components/footer'

import siteStyles from '../styles/site.module.css'

export default ({ Component, pageProps }) => (
  <div className={siteStyles.container}>
    <Header className={siteStyles.header} />
    <Component {...pageProps} />
    <Footer />
  </div>
)
