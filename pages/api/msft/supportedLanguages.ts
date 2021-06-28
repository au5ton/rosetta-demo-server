// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { cors } from '../../../lib/cors'
import { SupportedLanguage } from '../../../lib/models'
import { languages } from '../../../lib/microsoftTranslator'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  cors(res);

  const target = req.query.target as string | undefined

  const data = await languages(target);

  const results: SupportedLanguage[] = Object.keys(data.translation).map(e => ({ languageCode: e, displayName: data.translation[e].nativeName }));
  res.status(200).json(results);
}
