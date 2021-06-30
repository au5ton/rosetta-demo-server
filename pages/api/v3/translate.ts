// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { cors } from '../../../lib/cors'
import { recordHitMiss, tryFirestoreCache } from '../../../lib/firestoreCache';
import { translationServiceClient as translate, v3Parent as parent } from '../../../lib/googleTranslator'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  cors(res);
  // other params
  const targetLanguage = req.query.to as string|undefined;
  const sourceLanguage = req.query.from as string|undefined;
  // account for the 2 primary MIME types
  // see: https://cloud.google.com/translate/docs/advanced/translating-text-v3#translate_v3_translate_text-nodejs
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
    }, async ({ text, from, to, format }) => {
      // this was really annoying to map
      const temp = await translate.translateText({
        parent,
        contents: [text],
        mimeType: format === 'html' ? 'text/html' : 'text/plain',
        sourceLanguageCode: from,
        targetLanguageCode: to,
        model: null,
      });
      if(temp[0].translations && temp[0].translations.length > 0) {
        return temp[0].translations[0].translatedText ?? ''
      }
      return '';
    }, 'v3_cache')));

    const numHit = results.filter(e => e.isHit).length;
    const numMiss = results.filter(e => ! e.isHit).length

    res.setHeader('X-Translation-Cache-Hit-Count', numHit);
    res.setHeader('X-Translation-Cache-Miss-Count', numMiss);

    await recordHitMiss({
      hit: numHit,
      miss: numMiss,
      cacheCollectionName: 'v3_cache',
      time: new Date()
    });

    res.status(200).json(results.map(e => e.data));

    // const results = await translate.translateText({
    //   parent,
    //   contents: data,
    //   mimeType: format,
    //   sourceLanguageCode: sourceLanguage,
    //   targetLanguageCode: targetLanguage,
    //   model: null
    // });
  
    // res.status(200).json(results[0].translations?.map(e => e.translatedText))
  }
}
