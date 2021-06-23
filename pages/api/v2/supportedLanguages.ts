// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { translate } from '../../../lib/translate'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const target = req.query.target as string|undefined
  res.status(200).json(await translate.getLanguages(target))
}
