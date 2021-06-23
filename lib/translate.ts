import { v2, v3 } from '@google-cloud/translate'

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
