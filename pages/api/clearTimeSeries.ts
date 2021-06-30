// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { cors } from '../../lib/cors'
import { db } from '../../lib/firebaseHelper'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  cors(res);

  try {
    await db.recursiveDelete(db.collection('cache_series'))
    res.status(200).json(true);
  }
  catch(err) {
    res.status(200).json(false);
  }
}
