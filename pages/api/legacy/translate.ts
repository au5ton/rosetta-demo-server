// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { cors } from '../../../lib/cors'
// Legacy wrapper for free usage, reliability will vary
import { default as ghettoTranslate } from '@vitalets/google-translate-api'
import { recordHitMiss, tryFirestoreCache } from '../../../lib/firestoreCache'

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
    ), 'legacy_cache')));

    const numHit = results.filter(e => e.isHit).length;
    const numMiss = results.filter(e => ! e.isHit).length
    const numCharHit = results.filter(e => e.isHit).map(e => e.data.length).reduce((previous, current) => previous + current, 0);
    const numCharMiss = results.filter(e => ! e.isHit).map(e => e.data.length).reduce((previous, current) => previous + current, 0);

    res.setHeader('X-Translation-Cache-Hit-Count', numHit);
    res.setHeader('X-Translation-Cache-Miss-Count', numMiss);
    res.setHeader('X-Translation-Cache-Characters-Hit', numCharHit);
    res.setHeader('X-Translation-Cache-Characters-Miss', numCharMiss);

    await recordHitMiss({
      hit: numHit,
      miss: numMiss,
      hitCharacters: numCharHit,
      missCharacters: numCharMiss,
      cacheCollectionName: 'legacy_cache',
      time: new Date()
    });

    res.status(200).json(results.map(e => e.data));
  }
}
