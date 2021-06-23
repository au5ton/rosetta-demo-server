// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { cors } from '../../../lib/cors'
import { translate } from '../../../lib/translate'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  cors(res);
  const target = req.query.target as string|undefined

  const results = await translate.getLanguages(target);

  res.status(200).json(results[0].map(({ code, name }) => ({ displayName: name, languageCode: code })))
}
