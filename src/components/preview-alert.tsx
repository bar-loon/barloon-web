import Link from 'next/link'

import styles from '../styles/preview-alert.module.css'

export default ({ slug = '' }) => (
  <div className={styles.previewAlertContainer}>
    <div className={styles.previewAlert}>
      <b>Note:</b>
      {` `}Viewing in preview mode{' '}
      <Link href={`/api/clear-preview${slug && `?slug=${slug}`}`}>
        <button className={styles.escapePreview}>Exit Preview</button>
      </Link>
    </div>
  </div>
)
