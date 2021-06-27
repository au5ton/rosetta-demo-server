import { v2, v3 } from '@google-cloud/translate'

/**
 * To use the Google Translate API, we use a Service Account.
 * For Google APIs, the necessary credentials for service accounts comes in the form of a JSON file
 * with the multiple fields necessary to access an API.
 * 
 * In the particular environment of this sample application, we are deploying to Vercel using a Next.js
 * application. However, the limitations of the Vercel makes adding an actual file securely to our deployment
 * challenging. As a workaround, we encoded the entire service account JSON file to base64 and saved it as an
 * environment variable, which is securely managed by Vercel.
 * 
 * There are better ways to do this if you are working in a different environment.
 * 
 * see: https://cloud.google.com/translate/docs/setup#service_account_and_private_key
 */
const serviceAccount = JSON.parse(Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS as any, 'base64').toString());
const config = {
  projectId: serviceAccount.project_id,
  credentials: {
    client_email: serviceAccount.client_email,
    private_key: serviceAccount.private_key,
  }
}

export const translate = new v2.Translate(config);
export const translationServiceClient = new v3.TranslationServiceClient(config);
export const v3Parent = `projects/${serviceAccount.project_id}`;
