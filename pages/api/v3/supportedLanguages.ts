// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { cors } from '../../../lib/cors'
import { translationServiceClient as translate, v3Parent as parent } from '../../../lib/googleTranslator'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  cors(res);
  let target = req.query.target as string|undefined
  if(target === undefined) target = 'en';
  
  const results = await translate.getSupportedLanguages({ parent, displayLanguageCode: target, model: null })

  res.status(200).json(results[0].languages?.map(({displayName, languageCode}) => ({ displayName, languageCode })))
}
