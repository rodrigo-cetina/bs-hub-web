import React, { createContext, useState, useEffect } from 'react'
import jwt_decode from 'jwt-decode'
import { PATH_ROUTES } from 'routes/config/Paths'
import { IAuthUser } from 'types/User'
import { Role } from 'types/Role'
import { ILoginWithAuthResponse, FirebaseLogout } from 'firebaseUtil/LoginWithFirebase'
import { IPermissionTree, InitializeValidationTree, getValidationTree } from './permissionsTree'
import { useNavigate } from 'react-router-dom'
import requestService from 'services/requestService'
import moment from 'moment'

export interface IAuthContext {
  token: string | null
  photoUrl: string | null
  loginWithOAuth: (params: ILoginWithAuthResponse)=>void
  logout: Function
  isLogged: ()=>boolean
  getDecodeToken: Function
  authUser: IAuthUser | null
  permissions: IPermissionTree<boolean>
}

export const AuthContext = createContext<IAuthContext>({
  token: null,
  photoUrl: null,
  loginWithOAuth: ()=>{},
  logout: ()=>{},
  isLogged: ()=>false,
  getDecodeToken: ()=>{},
  authUser: null,
  permissions: InitializeValidationTree(),
})

export interface AuthProviderProps {
  children?: React.ReactNode | React.ReactNode[]
}

export interface AuthToken {
  iat: number
  exp: number
  auth_time : number
}

interface ILogoutInterval {
  vigency: number
  active: boolean
}

const AuthProvider = (props: AuthProviderProps) => {
  const [token, setToken] = useState<string|null>(null)
  const [authUser, setAuthUser] = useState<IAuthUser|null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  
  const [logoutInterval, setLogoutInterval] = useState<ILogoutInterval>({vigency: 0, active: false})
  const [intervalId, setIntervalId] = useState<number | null>(null)

  const [permissions, setPermissions] = useState<IPermissionTree<boolean>>(InitializeValidationTree())

  const navigate = useNavigate()

  const loginWithOAuth = async ({token, user, photoURL}: ILoginWithAuthResponse) => {
    localStorage.setItem('jwt', token)
    localStorage.setItem('authUser', JSON.stringify(user))
    
    if(photoURL !== null)
    localStorage.setItem('photoURL', photoURL)

    setToken(token)
    //aut-time - exp * 1000
    const {iat, exp, auth_time} = jwt_decode<AuthToken>(token)
    const vigency = (moment(exp).diff(auth_time, 'milliseconds'))*1000;
    setLogoutInterval({
      vigency,
      active: true,
    })

    async function getUserRoles():Promise<Role[]> {
      const roles:Role[] = []

      if(user.roles.length === 0)
      return roles

      for(let i = 0; i < user.roles.length; i++){
        try {
          const res = await requestService({
            url: `/roles/${user.roles[i]._id}`,
          })

          roles.push(res)
        } catch (error: any) {

        }
      }

      return roles
    }

    const roles = await getUserRoles()

    const nextAuthUser:IAuthUser = {
      ...user,
      roles: roles,
    }

    const validationTree = getValidationTree(roles)
    setAuthUser(nextAuthUser)
    setPermissions(validationTree)

    setTimeout(()=>{
      if(validationTree.watchUsers)
      navigate(PATH_ROUTES.USERS)
    }, 120)
  }

  const logout = () => {
    localStorage.removeItem('jwt')
    localStorage.removeItem('authUser')
    localStorage.removeItem('photoURL')
    setToken(null)
    setAuthUser(null)
    setPhotoUrl(null)
    setPermissions(InitializeValidationTree())
    FirebaseLogout()
    navigate(PATH_ROUTES.LOGIN)

    setLogoutInterval({
      vigency: 0,
      active: false,
    })

    if(intervalId !== null){
      clearInterval(intervalId)
      setIntervalId(null)
    }
  }

  /**UseEffect para la salida automática */
  useEffect(()=>{
    if(logoutInterval.active){
      if(logoutInterval.vigency <= 0){
        setLogoutInterval({vigency: 0, active: false })
        logout()

        if(intervalId !== null){
          clearInterval(intervalId)
          setIntervalId(null)          
        }
      }
  
      if(logoutInterval.vigency > 0 && intervalId === null){
        const timeoutId = setInterval(()=>{
          setLogoutInterval(prev=>{
            const nextVigency = prev.vigency -1
            if(nextVigency <= 0){
              logout()
            }

            return {
              vigency: nextVigency,
              active: nextVigency > 0 ? prev.active : false,
            }
          })
        }, 1000)
        setIntervalId(Number(timeoutId))
      }
    }
  },
  [
    logoutInterval.active,
    logoutInterval.vigency,
  ])

  async function getUserRoles(user: IAuthUser):Promise<Role[]> {
    const roles:Role[] = []

    if(user.roles.length === 0)
    return roles

    for(let i = 0; i < user.roles.length; i++){
      try {
        const res = await requestService({
          url: `/roles/${user.roles[i]._id}`,
        })

        roles.push(res)
      } catch (error: any) {

      }
    }

    return roles
  }

  async function recallRoles (user:IAuthUser) {
    const roles = await getUserRoles(user)
    const validationTree = getValidationTree(roles)
    setPermissions(validationTree)
    return {roles, validationTree}
  } 

  const isLogged = () => {
    const token = localStorage.getItem('jwt')
    if (token !== null) {

      /* const exp: number = jwt_decode<AuthToken>(token).exp */
      const { exp } = jwt_decode<AuthToken>(token)
      if(exp * 1000 < Date.now()){
        logout()
        return false
      }
      setTimeout(logout, (exp*1000)-Date.now());
      const stringUser = localStorage.getItem('authUser')
      if(stringUser !== null){
        if(stringUser !== JSON.stringify(authUser)){
          const user:IAuthUser = JSON.parse(stringUser)
          setAuthUser(user)
          recallRoles(user)
          const photoUrl = localStorage.getItem('photoURL')
          setPhotoUrl(photoUrl)
          return true
        }
      }

    }
    return !!token
  }

  /**@deprecated */
  const getDecodeToken = () => {
    if(token !== null)
    return jwt_decode<AuthToken>(token)
  
    return {}
  }

  const contextValue:IAuthContext= {
    token,
    photoUrl,
    loginWithOAuth,
    logout,
    isLogged,
    getDecodeToken,
    authUser,
    permissions,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
