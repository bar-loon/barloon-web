import { useRouter } from 'next/router'
import Image from 'next/image'
import Title from './title'
import PreviewAlert from './preview-alert'
import Heading from './heading'
import components from './dynamic'
import ReactJSXParser from '@zeit/react-jsx-parser'
import styles from '../styles/post.module.css'
import { textBlock } from '../lib/notion/renderers'
import React, { CSSProperties, useEffect } from 'react'
import { getDateStr } from '../lib/blog-helpers'

const renderBlocks = (post) => {
  const listTypes = {
    bulleted_list: 'ul',
    numbered_list: 'ol',
  } as const
  const listItems: {
    [id: string]: {
      id: string
      listTagName: string
      isNested: boolean
      nestIds: string[]
      children: React.ReactFragment
    }
  } = {}
  return (post.content || []).map((block, blockIdx) => {
    const { value } = block
    const { type, properties, id, parent_id } = value
    const isLast = blockIdx === post.content.length - 1
    const isList = listTypes.hasOwnProperty(type)
    const listItemIds = Object.keys(listItems)
    const toRender = []

    if (isList) {
      listItems[id] = {
        id,
        listTagName: components[listTypes[type]],
        isNested: Boolean(listItems[parent_id]),
        nestIds: [],
        children: textBlock(properties?.title, true, id),
      }

      if (listItems[id].isNested) {
        listItems[parent_id].nestIds.push(id)
      }
    }

    if (listItemIds.length > 0 && (isLast || !isList)) {
      toRender.push(
        React.createElement(
          components[listItems[listItemIds[0]].listTagName],
          { key: listItemIds[listItemIds.length - 1] },
          listItemIds.map((listItemId) => {
            const item = listItems[listItemId]
            delete listItems[listItemId]
            if (item.isNested) return null

            const createEl = (item) =>
              React.createElement(
                components.li,
                { key: item.id },
                item.children,
                item.nestIds.length > 0
                  ? React.createElement(
                      components[listItems[item.nestIds[0]].listTagName],
                      { key: `sub-list${item.id}` },
                      item.nestIds.map((nestId) => createEl(listItems[nestId]))
                    )
                  : null
              )
            return createEl(item)
          })
        )
      )
    }

    const renderHeading = (Type: string | React.ComponentType) => {
      toRender.push(
        <Heading key={id}>
          <Type key={id}>{textBlock(properties.title, true, id)}</Type>
        </Heading>
      )
    }

    const renderBookmark = ({ link, title, description, format }) => {
      const { bookmark_icon: icon, bookmark_cover: cover } = format
      toRender.push(
        <div className={styles.bookmark}>
          <div>
            <div style={{ display: 'flex' }}>
              <a
                target="_blank"
                rel="noopener noreferrer"
                className={styles.bookmarkContentsWrapper}
                href={link}
              >
                <div role="button" className={styles.bookmarkContents}>
                  <div className={styles.bookmarkInfo}>
                    <div className={styles.bookmarkTitle}>{title}</div>
                    <div className={styles.bookmarkDescription}>
                      {description}
                    </div>
                    <div className={styles.bookmarkLinkWrapper}>
                      {icon && (
                        <div className={styles.bookmarkLinkIcon}>
                          <Image
                            src={`https://www.notion.so/image/${encodeURIComponent(
                              icon
                            )}`}
                            alt="Bookmark"
                            width={16}
                            height={16}
                          />
                        </div>
                      )}
                      <div className={styles.bookmarkLink}>{link}</div>
                    </div>
                  </div>
                  {cover && (
                    <div className={styles.bookmarkCover}>
                      <Image
                        src={`https://www.notion.so/image/${encodeURIComponent(
                          cover
                        )}`}
                        alt="Cover"
                        layout="fill"
                        objectFit="cover"
                      />
                    </div>
                  )}
                </div>
              </a>
            </div>
          </div>
        </div>
      )
    }

    switch (type) {
      case 'page':
      case 'divider':
        break
      case 'text':
        if (properties) {
          toRender.push(textBlock(properties.title, false, id))
        }
        break
      case 'image':
      case 'video':
      case 'embed': {
        const {
          format: {
            block_width,
            block_height,
            display_source,
            block_aspect_ratio,
          },
        } = value
        const baseBlockWidth = 768
        const roundFactor = Math.pow(10, 2)
        // calculate percentages
        const width = block_width
          ? `${
              Math.round((block_width / baseBlockWidth) * 100 * roundFactor) /
              roundFactor
            }%`
          : block_height || '100%'

        const useWrapper = Boolean(block_aspect_ratio)
        const key = !useWrapper && id
        const src = `/api/asset?assetUrl=${encodeURIComponent(
          display_source
        )}&blockId=${id}`
        const className = useWrapper ? 'asset-wrapper' : undefined
        const mediaStyle: CSSProperties = useWrapper
          ? {
              width: '100%',
              height: '100%',
              border: 'none',
              position: 'absolute',
              top: 0,
            }
          : {
              width,
              border: 'none',
              height: block_height,
              display: 'block',
              maxWidth: '100%',
            }

        const children = {
          image: (
            <img
              key={key}
              src={src}
              alt="An image from Notion"
              style={mediaStyle}
            />
          ),
          video: (
            <video
              key={key}
              src={src}
              style={mediaStyle}
              controls
              loop
              muted
              autoPlay
            />
          ),
          embed: (
            <iframe
              key={key}
              src={src}
              className={className}
              style={mediaStyle}
            />
          ),
        }

        const Media = ({
          useWrapper,
          children,
        }: {
          useWrapper: boolean
          children: JSX.Element
        }) => {
          if (useWrapper)
            return (
              <div
                style={{
                  paddingTop: `${Math.round(block_aspect_ratio * 100)}%`,
                  position: 'relative',
                }}
                className="asset-wrapper"
                key={id}
              >
                {children}
              </div>
            )
          return children
        }

        toRender.push(
          <Media useWrapper={useWrapper}>
            {(value.file_ids && children[type]) || children.embed}
          </Media>
        )
        break
      }
      case 'header':
        renderHeading('h1')
        break
      case 'sub_header':
        renderHeading('h2')
        break
      case 'sub_sub_header':
        renderHeading('h3')
        break
      case 'bookmark':
        const { link, title, description } = properties
        const { format = {} } = value
        renderBookmark({ link, title, description, format })
        break
      case 'code': {
        if (properties.title) {
          const content = properties.title[0][0]
          const language = properties.language[0][0]

          if (language === 'LiveScript') {
            // this requires the DOM for now
            toRender.push(
              <ReactJSXParser
                key={id}
                jsx={content}
                components={components}
                componentsOnly={false}
                renderInpost={false}
                allowUnknownElements={true}
                blacklistedTags={['script', 'style']}
              />
            )
          } else {
            toRender.push(
              <components.Code key={id} language={language || ''}>
                {content}
              </components.Code>
            )
          }
        }
        break
      }
      case 'quote': {
        if (properties.title) {
          toRender.push(
            React.createElement(
              components.blockquote,
              { key: id },
              properties.title
            )
          )
        }
        break
      }
      case 'callout': {
        toRender.push(
          <div className="callout" key={id}>
            {value.format?.page_icon && <div>{value.format?.page_icon}</div>}
            <div className="text">{textBlock(properties.title, true, id)}</div>
          </div>
        )
        break
      }
      case 'tweet': {
        if (properties.html) {
          toRender.push(
            <div
              dangerouslySetInnerHTML={{ __html: properties.html }}
              key={id}
            />
          )
        }
        break
      }
      case 'equation': {
        if (properties && properties.title) {
          const content = properties.title[0][0]
          toRender.push(
            <components.Equation key={id} displayMode={true}>
              {content}
            </components.Equation>
          )
        }
        break
      }
      default:
        if (process.env.NODE_ENV !== 'production' && !isList) {
          console.log('unknown type', type)
        }
        break
    }
    return toRender
  })
}

const Post = ({ post, redirect, preview }) => {
  const router = useRouter()

  useEffect(() => {
    const twitterSrc = 'https://platform.twitter.com/widgets.js'
    // make sure to initialize any new widgets loading on
    // client navigation
    if (post && post.hasTweet) {
      if ((window as any)?.twttr?.widgets) {
        ;(window as any).twttr.widgets.load()
      } else if (!document.querySelector(`script[src="${twitterSrc}"]`)) {
        const script = document.createElement('script')
        script.async = true
        script.src = twitterSrc
        document.querySelector('body').appendChild(script)
      }
    }
  }, [post])
  useEffect(() => {
    if (redirect && !post) {
      router.replace(redirect)
    }
  }, [redirect, post, router])

  // If the page is not yet generated, this will be displayed
  // initially until getStaticProps() finishes running
  if (router.isFallback) {
    return <div>Loading...</div>
  }

  // if you don't have a post at this point, and are not
  // loading one from fallback then  redirect back to the index
  if (!post) {
    return (
      <div className={styles.root}>
        <p>
          {
            "Woops! didn't find that post, redirecting you back to the blog index"
          }
        </p>
      </div>
    )
  }

  return (
    <>
      <Title title={post.Page} />
      {preview && <PreviewAlert slug={post.Slug} />}
      <div className={styles.root}>
        {post.Page && <h1>{post.Page}</h1>}
        {post.Authors.length > 0 && (
          <p className={styles.authors}>By: {post.Authors.join(' ')}</p>
        )}
        {post.Date && (
          <p className={styles.date}>Posted: {getDateStr(post.Date)}</p>
        )}

        {(!post.content || post.content.length === 0) && (
          <p>This post has no content</p>
        )}

        {renderBlocks(post)}
      </div>
    </>
  )
}

export default Post
