import { NextApiRequest, NextApiResponse } from 'next'

const ClearPreview = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.query.slug) {
    res.clearPreviewData()
    res.writeHead(307, { Location: `/article/${req.query.slug}` })
    res.end()
  } else {
    res.clearPreviewData()
    res.writeHead(307, { Location: `/article` })
    res.end()
  }
}

export default ClearPreview
