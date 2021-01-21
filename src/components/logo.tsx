import styles from '../styles/logo.module.css'

export default () => (
  <div className={styles.root}>
    <img className={styles.logo} src="/logo.png" />
    <img className={styles.logoType} src="/logo-type.svg" />
  </div>
)
