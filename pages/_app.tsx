import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { FirebaseAppProvider } from 'reactfire'
import { firebaseConfig } from '../lib/firebaseFront'
import 'firebase/firestore'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <FirebaseAppProvider firebaseConfig={firebaseConfig}>
      <Component {...pageProps} />
    </FirebaseAppProvider>
  );
}
export default MyApp
