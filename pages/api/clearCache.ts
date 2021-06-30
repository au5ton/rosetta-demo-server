// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { cors } from '../../lib/cors'
import { db } from '../../lib/firebaseHelper'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  cors(res);

  try {
    let collection = req.query.collection as string|undefined
    switch(collection) {
      case '*': {
        await db.recursiveDelete(db.collection('v2_cache'));
        await db.recursiveDelete(db.collection('v3_cache'));
        await db.recursiveDelete(db.collection('legacy_cache'));
        await db.recursiveDelete(db.collection('msft_cache'));
        break;
      }
      case 'v2_cache': {
        await db.recursiveDelete(db.collection('v2_cache'));
        break;
      }
      case 'v3_cache': {
        await db.recursiveDelete(db.collection('v3_cache'));
        break;
      }
      case 'legacy_cache': {
        await db.recursiveDelete(db.collection('legacy_cache'));
        break;
      }
      case 'msft_cache': {
        await db.recursiveDelete(db.collection('msft_cache'));
        break;
      }
    }
    res.status(200).json(true);
  }
  catch(err) {
    res.status(200).json(false);
  }
}
