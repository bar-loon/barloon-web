import { useRouter } from 'next/router'
import Title from './title'
import PreviewAlert from './preview-alert'
import Heading from './heading'
import components from './dynamic'
import ReactJSXParser from '@zeit/react-jsx-parser'
import styles from '../styles/post.module.css'
import { textBlock } from '../lib/notion/renderers'
import React, { CSSProperties, useEffect } from 'react'
import { getDateStr } from '../lib/blog-helpers'

const renderBlocks = post => {
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
        children: textBlock(properties.title, true, id),
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
          listItemIds.map(listItemId => {
            const item = listItems[listItemId]
            delete listItems[listItemId]
            if (item.isNested) return null

            const createEl = item =>
              React.createElement(
                components.li,
                { key: item.id },
                item.children,
                item.nestIds.length > 0
                  ? React.createElement(
                      components[listItems[item.nestIds[0]].listTagName],
                      { key: `sub-list${item.id}` },
                      item.nestIds.map(nestId => createEl(listItems[nestId]))
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
        const { format = {} } = value
        const {
          block_width,
          block_height,
          display_source,
          block_aspect_ratio,
        } = format
        const baseBlockWidth = 768
        const roundFactor = Math.pow(10, 2)
        // calculate percentages
        const width = block_width
          ? `${Math.round((block_width / baseBlockWidth) * 100 * roundFactor) /
              roundFactor}%`
          : block_height || '100%'

        const isImage = type === 'image'
        const Comp = isImage ? 'img' : 'video'
        const useWrapper = Boolean(block_aspect_ratio)
        const childStyle: CSSProperties = useWrapper
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

        let child = null

        if (!isImage && !value.file_ids) {
          // external resource use iframe
          child = (
            <iframe
              style={childStyle}
              src={display_source}
              key={!useWrapper ? id : undefined}
              className={!useWrapper ? 'asset-wrapper' : undefined}
            />
          )
        } else {
          // notion resource
          child = (
            <Comp
              key={!useWrapper ? id : undefined}
              src={`/api/asset?assetUrl=${encodeURIComponent(
                display_source as any
              )}&blockId=${id}`}
              controls={!isImage}
              alt={`An ${isImage ? 'image' : 'video'} from Notion`}
              loop={!isImage}
              muted={!isImage}
              autoPlay={!isImage}
              style={childStyle}
            />
          )
        }

        toRender.push(
          useWrapper ? (
            <div
              style={{
                paddingTop: `${Math.round(block_aspect_ratio * 100)}%`,
                position: 'relative',
              }}
              className="asset-wrapper"
              key={id}
            >
              {child}
            </div>
          ) : (
            child
          )
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

export default ({ post, redirect, preview }) => {
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
  }, [])
  useEffect(() => {
    if (redirect && !post) {
      router.replace(redirect)
    }
  }, [redirect, post])

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
          Woops! didn't find that post, redirecting you back to the blog index
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
