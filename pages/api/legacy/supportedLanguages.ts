// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { cors } from '../../../lib/cors'
import { SupportedLanguage } from '../../../lib/models';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  cors(res);

  const target = req.query.target as string | undefined

  const response = await fetch(`https://translate.googleapis.com/translate_a/l?client=te&alpha=true&hl=${target}&cb=callback`, {
    "credentials": "omit",
    "headers": {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
      "Accept": "*/*",
      "Accept-Language": "en-US,en;q=0.5",
      "Alt-Used": "translate.googleapis.com",
      "Pragma": "no-cache",
      "Cache-Control": "no-cache"
    },
    "referrer": "https://au5ton.github.io/",
    "method": "GET",
    "mode": "cors"
  });

  const jsonp = await response.text()
  const data: {
    sl: { [languageCode: string]: string },
    tl: { [languageCode: string]: string },
    al: {}
  } = JSON.parse(jsonp.substring(jsonp.indexOf("(") + 1, jsonp.lastIndexOf(")")));

  const results: SupportedLanguage[] = Object.keys(data.tl).map(e => ({ languageCode: e, displayName: data.tl[e] }));
  res.status(200).json(results);
}
