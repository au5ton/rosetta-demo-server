import { db } from './firebaseHelper'
import { computeSHA512Hash, encrypt, decrypt } from './encryption'
import { CacheTimeSeriesEntry } from './firebaseCommon'

export interface TranslatorArguments {
  text: string;
  from: string;
  to: string;
  format: 'text' | 'html';
}

export interface CacheResult<T> {
  isHit: boolean;
  data: T
}

export async function recordHitMiss(entry: CacheTimeSeriesEntry) {
  return await db.collection('cache_series').add(entry);
}

/**
 * Checks the Firestore database if the translation for this phrase has already been done.
 * If it has, return the cached value.
 * If it hasn't, perform the translation fresh and save it.
 * @param args 
 * @param fetcher 
 */
export async function tryFirestoreCache(args: TranslatorArguments, fetcher: (args: TranslatorArguments) => Promise<string>, collectionName: string = 'translation_cache'): Promise<CacheResult<string>> {
  const { text, from, to } = args;

  // create a document reference for this source text
  const docRef = db.collection(collectionName).doc(computeSHA512Hash(`${from}${text}`))
  const docSnap = await docRef.get()
  // attempt to hit cache
  if(docSnap.exists) {
    const docData = docSnap.data()
    // if we've found a cached match
    if(docData !== undefined && docData[to] !== undefined) {
      // if this translation has expired, delete it
      if(docData['__expire'] !== undefined && new Date().valueOf() > new Date(docData['__expire']).valueOf()) {
        await docRef.delete();
      }
      return {
        isHit: true,
        data: decrypt(docData[to])
      };
    }
  }
  // cache missed

  // get the translation
  const translatedText = await fetcher(args);
  
  // save the translation and original text
  const data: { [languageCode: string]: string | number } = {};
  data[from] = encrypt(text)
  data[to] = encrypt(translatedText)
  // expires 15 days into the future
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 15);
  data['__expire'] = expiry.valueOf();
  await docRef.set(data);

  // finally, return the value we want
  return {
    isHit: false,
    data: translatedText
  };
}
