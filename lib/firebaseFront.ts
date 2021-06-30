import * as firebase from 'firebase'

/**
 * i hate that i'm doing this, but Vercel doesn't have a good way to include secrets 
 * other than environment variables and the Google Translate service account key 
 * takes up the entire 4KB limit...
 */
export const firebaseConfig = {"apiKey":"AIzaSyDz7fwvnHknXfZB-vEiIZRkyqv4-m1ZsZo","projectId":"rosetta-demo-server"};

export const Timestamp = firebase.default.firestore.Timestamp;
