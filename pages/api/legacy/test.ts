// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { cors } from '../../../lib/cors'
import { SupportedLanguage } from '../../../lib/models'
import { decrypt, encrypt } from '../../../lib/encryption'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  cors(res);

  const op = req.query.op as string;
  const text = req.query.text as string;

  if(op === 'enc') {
    res.status(200).json(JSON.stringify(encrypt(text)));
  }
  else if(op === 'dec') {
    res.status(200).json(JSON.stringify(decrypt(text)));
  }
}
