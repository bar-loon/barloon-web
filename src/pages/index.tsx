import fetch from 'node-fetch'
import Post from '../components/post'
import getPageData from '../lib/notion/getPageData'
import getBlogIndex from '../lib/notion/getBlogIndex'
import getNotionUsers from '../lib/notion/getNotionUsers'

// Get the data for each blog post
export async function getStaticProps({ preview }) {
  // load the postsTable so that we can get the page's ID
  const postsTable = await getBlogIndex({ type: 'page' })
  const post = postsTable['about']

  // if we can't find the post or if it is unpublished and
  // viewed without preview mode then we just redirect to /
  const isPublished = post.Published === 'Yes'
  if (!post || (!isPublished && !preview)) {
    console.log(`Failed to find post for slug: about`)
    return {
      props: {
        redirect: '/',
        preview: false,
      },
      unstable_revalidate: 5,
    }
  }
  const postData = await getPageData(post.id)
  post.content = postData.blocks

  for (let i = 0; i < postData.blocks.length; i++) {
    const { value } = postData.blocks[i]
    const { type, properties } = value
    if (type == 'tweet') {
      const src = properties.source[0][0]
      // parse id from https://twitter.com/_ijjk/status/TWEET_ID format
      const tweetId = src.split('/')[5].split('?')[0]
      if (!tweetId) continue

      try {
        const res = await fetch(
          `https://api.twitter.com/1/statuses/oembed.json?id=${tweetId}`
        )
        const json = await res.json()
        properties.html = json.html.split('<script')[0]
        post.hasTweet = true
      } catch (_) {
        console.log(`Failed to get tweet embed for ${src}`)
      }
    }
  }

  const { users } = await getNotionUsers(post.Authors || [])
  post.Authors = Object.keys(users).map(id => users[id].full_name)

  return {
    props: {
      post,
      preview: preview || false,
    },
    unstable_revalidate: 10,
  }
}

export default Post
