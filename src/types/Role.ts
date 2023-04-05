import { Permission } from './Permission'
import { UserType } from './UserType'

export interface Role {
  _id: string
  name: string
  permissions: Permission[]
  userTypes: UserType[]
  isActive: boolean
  isArchived: boolean
  isDefault: boolean
  createdAt: string
}