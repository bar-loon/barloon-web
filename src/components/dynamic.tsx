import dynamic from 'next/dynamic'
import ExternalLink from './external-link'

export default {
  // default tags
  ol: 'ol',
  ul: 'ul',
  li: 'li',
  p: 'p',
  blockquote: 'blockquote',
  a: ExternalLink,

  Code: dynamic(() => import('./code')),
  Counter: dynamic(() => import('./counter')),
  Equation: dynamic(() => import('./equation')),
}
