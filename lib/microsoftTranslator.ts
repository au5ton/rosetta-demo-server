import fetch from 'node-fetch'

const subscriptionKey = process.env.MSFT_TRANSLATOR_SUBSCRIPTION_KEY;
const host = "https://api.cognitive.microsofttranslator.com";
const location = process.env.MSFT_TRANSLATOR_LOCATION;

export interface MSFTLanguages {
  /** The value of the translation property is a dictionary of (key, value) pairs. Each key is a BCP 47 language tag. A key identifies a language for which text can be translated to or translated from. The value associated with the key is a JSON object with properties that describe the language: */
  translation: { [languageCode: string]: MSFTLanguageTranslation };
  transliteration: { [languageCode: string]: any };
  dictionary: { [languageCode: string]: any };
}

export interface MSFTLanguageTranslation {
  /** Display name of the language in the locale requested via target parameter. */
  name: string;
  /** Display name of the language in the locale native for this language. */
  nativeName: string;
  /** Directionality, which is rtl for right-to-left languages or ltr for left-to-right languages. */
  dir: 'ltr' | 'rtl';
}

export interface MSFTTranslate {
  translations: MSFTTranslateItem[];
}

export interface MSFTTranslateItem {
  text: string;
  to: string;
}

export async function languages(target: string = 'en', scope: 'translation' | 'transliteration' | 'dictionary' = 'translation'): Promise<MSFTLanguages> {
  const res = await fetch(`${host}/languages?api-version=3.0&scope=${scope}`, {
    headers: {
      'Accept-Language': target,
      'Ocp-Apim-Subscription-Key': subscriptionKey ?? '',
      'Ocp-Apim-Subscription-Region': location ?? '',
    }
  });
  return await res.json() as MSFTLanguages;
}

export async function translate(text: string, from: string, to: string,  format: 'plain' | 'html' = 'plain'): Promise<[ MSFTTranslate ]> {
  const res = await fetch(`${host}/translate?api-version=3.0&from=${from}&to=${to}`, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': subscriptionKey ?? '',
      'Ocp-Apim-Subscription-Region': location ?? '',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([{
      text,
    }]),
  });
  return await res.json() as [ MSFTTranslate ];
}

