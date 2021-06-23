// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { translate } from '../../../lib/translate'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  // other params
  const targetLanguage = req.query.to as string|undefined;
  const sourceLanguage = req.query.from as string|undefined;
  // get words to be translated
  const data: string[] = Array.isArray(req.body) && req.body.length > 0 && req.body.every(e => typeof e === 'string') ? req.body : [];

  const results = await translate.translate(data, {
    format: 'html',
    from: sourceLanguage,
    to: targetLanguage
  });

  res.status(200).json(results[0])
}
