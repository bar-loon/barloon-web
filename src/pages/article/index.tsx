import Link from 'next/link'
import Title from '../../components/title'
import PreviewAlert from '../../components/preview-alert'

import styles from '../../styles/post-list.module.css'

import {
  getBlogLink,
  getDateStr,
  postIsPublished,
} from '../../lib/blog-helpers'
import { textBlock } from '../../lib/notion/renderers'
import getNotionUsers from '../../lib/notion/getNotionUsers'
import getBlogIndex from '../../lib/notion/getBlogIndex'

export async function getStaticProps({ preview }) {
  const postsTable = await getBlogIndex()

  const authorsToGet: Set<string> = new Set()
  const posts: any[] = Object.keys(postsTable)
    .map(slug => {
      const post = postsTable[slug]
      // remove draft posts in production
      if (!preview && !postIsPublished(post)) {
        return null
      }
      post.Authors = post.Authors || []
      for (const author of post.Authors) {
        authorsToGet.add(author)
      }
      return post
    })
    .filter(Boolean)

  const { users } = await getNotionUsers([...authorsToGet])

  posts.map(post => {
    post.Authors = post.Authors.map(id => users[id].full_name)
  })

  return {
    props: {
      preview: preview || false,
      posts,
    },
    revalidate: 10,
  }
}

const Index = ({ posts = [], preview }) => {
  return (
    <>
      <Title title="Blog" />
      {preview && <PreviewAlert />}
      <div>
        <h1>All Articles</h1>
        {posts.length === 0 && <p>There are no posts yet</p>}
        {posts.map(post => {
          return (
            <div className={styles.root} key={post.Slug}>
              <h3>
                <Link
                  href="/article/[slug]"
                  as={getBlogLink({ slug: post.Slug })}
                >
                  <a className={styles.title}>
                    {!post.Published && (
                      <span className={styles.draftBadge}>Draft</span>
                    )}
                    <span>{post.Page}</span>
                  </a>
                </Link>
              </h3>
              {post.Authors.length > 0 && (
                <p className={styles.authors}>By: {post.Authors.join(' ')}</p>
              )}
              {post.Date && (
                <p className={styles.date}>Posted: {getDateStr(post.Date)}</p>
              )}
              {(post.preview || []).length > 0 && (
                <p>
                  {post.preview.map((block, idx) =>
                    textBlock(block, true, `${post.Slug}${idx}`)
                  )}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}

export default Index
