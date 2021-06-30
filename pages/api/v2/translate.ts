// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { cors } from '../../../lib/cors'
import { recordHitMiss, tryFirestoreCache } from '../../../lib/firestoreCache';
import { translate } from '../../../lib/googleTranslator'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  cors(res);
  // other params
  const targetLanguage = req.query.to as string|undefined;
  const sourceLanguage = req.query.from as string|undefined;
  let format: 'html' | 'text' = 'text';
  if(typeof req.query.format === 'string') {
    if(req.query.format === 'html') format = 'html';
    if(req.query.format === 'text') format = 'text';
  }
  // get words to be translated
  const data: string[] = Array.isArray(req.body) && req.body.length > 0 && req.body.every(e => typeof e === 'string') ? req.body : [];

  if(data.length === 0 || targetLanguage === undefined || sourceLanguage === undefined) {
    res.status(200).json([]);
  }
  else {

    // Complete all translations in parallel and check against the cache
    const results = await Promise.all(data.map(e => tryFirestoreCache({
      text: e,
      from: sourceLanguage,
      to: targetLanguage,
      format,
    }, async ({ text, from, to, format }) => (
      (await translate.translate(text, { to, from, format }))[0]
    ), 'v2_cache')));

    const numHit = results.filter(e => e.isHit).length;
    const numMiss = results.filter(e => ! e.isHit).length

    res.setHeader('X-Translation-Cache-Hit-Count', numHit);
    res.setHeader('X-Translation-Cache-Miss-Count', numMiss);

    await recordHitMiss({
      hit: numHit,
      miss: numMiss,
      cacheCollectionName: 'v2_cache',
      time: new Date()
    });

    res.status(200).json(results.map(e => e.data));

    // const results = await translate.translate(data, {
    //   format: format,
    //   from: sourceLanguage,
    //   to: targetLanguage
    // });
  
    // res.status(200).json(results[0])
  }
}
