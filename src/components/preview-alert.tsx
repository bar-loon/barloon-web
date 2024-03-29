import Link from 'next/link'

import styles from '../styles/preview-alert.module.css'

const PreviewAlert = ({ slug = '' }) => (
  <div className={styles.root}>
    <div className={styles.inner}>
      <b>Note:</b>
      Viewing in preview mode
      <Link href={`/api/clear-preview${slug && `?slug=${slug}`}`} passHref>
        <button className={styles.exitButton}>Exit Preview</button>
      </Link>
    </div>
  </div>
)

export default PreviewAlert
