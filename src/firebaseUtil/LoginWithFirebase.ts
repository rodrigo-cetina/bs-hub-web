import {
  GoogleAuthProvider,
  OAuthProvider,
  getAuth,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { initializeApp } from 'firebase/app'
import { firebaseConfig } from 'firebaseUtil/FirebaseSettings'
import requestService from 'services/requestService'
import { IAuthUser } from 'types/User'

export interface ILoginWithAuthResponse {
  user: IAuthUser
  token: string
  photoURL: string | null
}

interface ErrorResponse extends Error {
  response?: {
    data: {
      code: string
      message: string
    }
  }
  code: string
  name: string
}

export const UNKNOWN_ERROR = 'Error desconocido'
export const USER_NOT_FOUND = 'USER_NOT_FOUND'
export const USER_IS_NOT_ACTIVE = 'USER_IS_NOT_ACTIVE'
export const INVALID_PASSWORD = 'INVALID_PASSWORD'
export const FIREBASE_ERROR = 'FirebaseError'
export const FIREBASE_WRONG_PASSWORD = 'auth/wrong-password'
export const EMAIL_NOT_FOUND = 'auth/user-not-found'
export const POUP_CLOSED_BY_USER = 'auth/popup-closed-by-user'

function processError (error: ErrorResponse) {
  FirebaseLogout()
  
  if(error.name)
  if(error.name === FIREBASE_ERROR){
    if(error.code === FIREBASE_WRONG_PASSWORD)
    return 'Contraseña incorrecta'
    if(error.code === EMAIL_NOT_FOUND)
    return 'Usuario no registrado'
    if(error.code === POUP_CLOSED_BY_USER)
    return 'Inicio de sesion cancelado por el usuario'

  }

  if(error.response){
    const code = error.response.data.code

    if(code === USER_NOT_FOUND)
    return 'Usuario no registrado'
    if(code === USER_IS_NOT_ACTIVE)
    return 'Usuario desactivado'

    if(code !== undefined)
    return code
  }

  return UNKNOWN_ERROR
}

export async function LoginWithGoogle():Promise<ILoginWithAuthResponse | string> {
  initializeApp(firebaseConfig)
  const googleProvider = new GoogleAuthProvider()
  const auth = getAuth()
  try {
    const result = await signInWithPopup(auth, googleProvider)
    const { photoURL } = result.user
    const token = await result.user.getIdToken()
    return await verifyToken({token, photoURL})
  } catch (error: any) {
    return processError(error)
  }
}

export async function LoginWithMS():Promise<ILoginWithAuthResponse | string> {
  initializeApp(firebaseConfig)
  const MSProvider = new OAuthProvider('microsoft.com')
  const auth = getAuth()
  try {
    const result = await signInWithPopup(auth, MSProvider)
    const { photoURL } = result.user
    const token = await result.user.getIdToken()
    return await verifyToken({token, photoURL})
  } catch (error: any) {
    return processError(error)
  }
}

export async function LoginWithEmailAndPassword({email, password}:{email: string, password: string}):Promise<ILoginWithAuthResponse | string> {
  initializeApp(firebaseConfig)
  const auth = getAuth()
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const token = await userCredential.user.getIdToken()    

    return await verifyToken({token, photoURL: null})
  } catch(error: any) {
    return processError(error)
  }
}

export async function FirebaseLogout () {
  initializeApp(firebaseConfig)
  const auth = getAuth()
  signOut(auth)
}

async function verifyToken ({token, photoURL}: {token: string, photoURL: string | null}) {
  try {
    const res: IAuthUser = await requestService({
      url: 'auth/check-token?app=false',
      overrideHeaders: {
        'Authorization' : `Bearer ${token}`,
      },
    })
    return { user: res, token, photoURL }
  } catch (error: any) {
    throw error
  }
}