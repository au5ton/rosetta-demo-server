import * as firebase from 'firebase'

export const firebaseConfig = JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG ?? '');

export const Timestamp = firebase.default.firestore.Timestamp;
