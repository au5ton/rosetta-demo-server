// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { cors } from '../../../lib/cors'
// Legacy wrapper for free usage, reliability will vary
import { default as ghettoTranslate } from '@vitalets/google-translate-api'
import { tryFirestoreCache } from '../../../lib/firestoreCache'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  cors(res);
  // other params
  const targetLanguage = req.query.to as string | undefined;
  const sourceLanguage = req.query.from as string | undefined;
  // get words to be translated
  const data: string[] = Array.isArray(req.body) && req.body.length > 0 && req.body.every(e => typeof e === 'string') ? req.body : [];

  if (data.length === 0 || targetLanguage === undefined || sourceLanguage === undefined) {
    res.status(200).json([]);
  }
  else {
    // Complete all translations in parallel and check against the cache
    const results = await Promise.all(data.map(e => tryFirestoreCache({
      text: e,
      from: sourceLanguage,
      to: targetLanguage,
      format: 'text',
    }, async ({ text, from, to }) => (
      (await ghettoTranslate(text, { from, to, })).text
    ))));

    res.setHeader('X-Translation-Cache-Hit-Count', results.filter(e => e.isHit).length);
    res.setHeader('X-Translation-Cache-Miss-Count', results.filter(e => ! e.isHit).length);

    res.status(200).json(results.map(e => e.data));
  }
}
