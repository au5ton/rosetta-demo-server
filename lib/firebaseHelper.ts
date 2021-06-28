import * as admin from 'firebase-admin';

const serviceAccount = JSON.parse(Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS as any, 'base64').toString());

// This works without extra work doing authentication for some reason which is cool
export const firebase = !admin.apps.length ? admin.initializeApp({ credential: admin.credential.cert(serviceAccount) }) : admin.app();

// Configure a Firestore DB object that is preconfigured and from the "correct" instance (maybe?)
const _db = firebase.firestore();
//_db.settings({ ignoreUndefinedProperties: true });
export const db = _db;
export const FieldValue = admin.firestore.FieldValue;
