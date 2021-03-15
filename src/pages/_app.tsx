import '../styles/global.css'
import 'katex/dist/katex.css'
import Header from '../components/header'
import Footer from '../components/footer'

import styles from '../styles/app.module.css'

const App = ({ Component, pageProps }) => (
  <div className={styles.container}>
    <Header className={styles.header} />
    <Component {...pageProps} />
    <Footer />
  </div>
)

export default App
