export const firebaseKeys:any = {
  apiKey: 'FIREBASE_API_KEY',
  authDomain: 'FIREBASE_AUTH_DOMAIN',
  projectId: 'FIREBASE_PROJECT_ID',
  storageBucket: 'FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'FIREBASE_MESSAGING_SENDER_ID',
  appId: 'FIREBASE_APP_ID',
  measurementId: 'FIREBASE_MEASUREMENT_ID',
}

const firebaseConfig: any = {
}

Object.keys(firebaseKeys).forEach(key=>{
  const processEnvKey = firebaseKeys[key]
  firebaseConfig[key] = process.env[ `REACT_APP_${processEnvKey}` ]
})

export {firebaseConfig}