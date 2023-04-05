import { UserType } from './UserType'
import { elementKeyValue } from './DimensionObject'
import { Role } from './Role'
import { Profile } from './Profile'

export interface User {
  _id: string
  idOrigen: string
  names: string
  lastNames: string
  email: string
  phone: string
  address: string
  dimensions: elementKeyValue
  userType: UserType
  createdAt: string
  isDefault : boolean
  isActive: boolean
  isArchived: boolean
  securityLevel : number
  roles: Role[]
  profiles : Profile[]
}

export interface IAuthUser {
  id: string
  names: string
  lastNames: string
  email: string
  phone: string
  address: string
  dimensions: elementKeyValue
  createdAt: Date
  userType: UserType
  roles: Role[]
  iat: number
  exp: number
}