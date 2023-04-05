import { Role } from 'types/Role'

/**
 * @todo Registrar nombres de permisos conforme se agregen módulos
 * @description El proposito es facilitar el acceso a los permisos para el desarrollador 
 * */
export interface IPermissionTree<T> {
  //key para el desarrollador: nombre del permiso
  [key:string]: T

  'watchUsers': T
  'watchArchivedUsers': T
  'recallArchivedUsers': T
  'addUsers': T
  'setActiveUsers': T
  'updateUsers': T
  'archiveUsers': T

  'watchRoles': T
  'watchArchivedRoles': T
  'recallArchivedRoles': T
  'addRoles': T
  'setActiveRoles': T
  'updateRolesAndPermissions': T
  'archiveRoles': T

  'watchUserTypes': T
  'addUserTypes': T
  'updateUserTypes': T
  'deleteUserTypes': T

  'watchServiceTypes': T
  'addServiceTypes': T
  'updateServiceTypes': T
  'setActiveServiceTypes': T
  'deleteServiceTypes': T
  'archiveServiceTypes': T
  'recallServiceTypes': T

  'watchServices': T
  'addServices': T
  'updateServices': T
  'setActiveServices': T
  'deleteServices': T
  'archiveServices': T
  'recallServices': T

  'watchSegments': T
  'addSegments': T
  'updateSegments': T
  'archiveSegments': T
  'recallSegments': T
  'deleteSegments': T
  'setActiveSegments': T

  'watchProfiles': T
  'addProfiles': T
  'updateProfiles': T
  'archiveProfiles': T
  'recallProfiles': T
  'changeProfileSecurityLevel' : T
  'deleteProfiles': T
  'setActiveProfiles': T

  'watchCategory': T
  'addCategory': T
  'updateCategory': T
  'archiveCategory': T
  'recallCategory': T
  'deleteCategory': T
  'setActiveCategory': T

}

interface IBooleanPermissionTree {
  [key: string]: boolean
}

/**Registrar llaves y nombres */
export const permissionTreeKeys:IPermissionTree<string> = {
  'watchUsers': 'users:watch',
  'watchArchivedUsers': 'users:watchArchived',
  'recallArchivedUsers': 'users:recall',
  'addUsers': 'users:add',
  'setActiveUsers': 'users:setActive',
  'updateUsers': 'users:edit',
  'archiveUsers': 'users:archive',

  'watchRoles': 'roles:watch',
  'watchArchivedRoles': 'roles:watchArchived',
  'recallArchivedRoles': 'roles:recall',
  'addRoles': 'roles:add',
  'setActiveRoles': 'roles:setActive',
  'updateRolesAndPermissions': 'roles:edit',
  'archiveRoles': 'roles:archive',

  'watchUserTypes': 'userTypes:watch',
  'addUserTypes': 'userTypes:add',
  'updateUserTypes': 'userTypes:edit',
  'deleteUserTypes': 'userTypes:delete',

  'watchServiceTypes': 'serviceTypes:watch',
  'addServiceTypes': 'serviceTypes:add',
  'updateServiceTypes': 'serviceTypes:edit',
  'setActiveServiceTypes': 'serviceTypes:setActive',
  'deleteServiceTypes': 'serviceTypes:delete',
  'archiveServiceTypes': 'serviceTypes:archive',
  'recallServiceTypes': 'serviceTypes:recall',

  'watchServices': 'services:watch',
  'addServices': 'services:Add',
  'updateServices': 'services:edit',
  'setActiveServices': 'services:setActive',
  'deleteServices': 'services:delete',
  'archiveServices': 'services:archive',
  'recallServices': 'services:recall',

  'watchSegments': 'segments:watch',
  'addSegments': 'segments:add',
  'updateSegments': 'segments:edit',
  'archiveSegments': 'segments:archive',
  'recallSegments': 'segments:recall',
  'deleteSegments': 'segments:delete',
  'setActiveSegments': 'segments:setActive',

  'watchProfiles': 'profiles:watch',
  'addProfiles': 'profiles:add',
  'updateProfiles': 'profiles:edit',
  'archiveProfiles': 'profiles:archive',
  'recallProfiles': 'profiles:recall',
  'changeProfileSecurityLevel' : 'profile:securityLevel',
  'deleteProfiles': 'profile:delete',
  'setActiveProfiles': 'profiles:setActive',

  'watchCategory': 'categories:watch',
  'addCategory': 'categories:add',
  'updateCategory': 'categories:edit',
  'archiveCategory': 'categories:archive',
  'recallCategory': 'categories:recall',
  'deleteCategory': 'categories:delete',
  'setActiveCategory': 'categories:setActive',
}

function getPermissionKey (name: string): string | null {
  let toReturn:string | null = null

  Object.keys(permissionTreeKeys).forEach((key)=>{
    const value:string | undefined = permissionTreeKeys[key]
    if(value === name)
    toReturn = key
  })

  return toReturn
} 

export function InitializeValidationTree():IPermissionTree<boolean>{
  const validationTree:IBooleanPermissionTree = {
  }

  Object.keys(permissionTreeKeys).forEach(key => {
    validationTree[key] = false
  })

  //@ts-ignore
  return validationTree
}

/**Obtiene el arbol con todos los permisos */
export function getValidationTree(roles:Role[] = []):IPermissionTree<boolean> {
  const validationTree:IPermissionTree<boolean> = InitializeValidationTree()
  
  /**Se mapea rol por rol y se obtienen los permisos válidos */
  roles.forEach((role)=>{
    role.permissions.forEach((permission)=>{
      const {name} = permission

      const key = getPermissionKey(name)
      if(key === null)
      return
      
      validationTree[key] = true      
    })
  })

  //@ts-ignore
  return validationTree
}
