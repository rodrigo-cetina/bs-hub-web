import { Permission } from 'types/Permission'
import { getModuleName } from './getModuleName'

export interface PermissionGroup {
  module: string
  permissions: Permission[]
}

export function groupPermissions (permissions: Permission[] = []): PermissionGroup[] {
  const groups: PermissionGroup[] = []

  function hasModule(module: string): boolean {
    return groups.find(t => t.module === module) !== undefined
  }

  function getModuleIndex(module: string): number {
    return groups.findIndex(t => t.module === module)
  }

  permissions.forEach((permission) => {
    const {module} = permission

    if(hasModule(module)){
      const index = getModuleIndex(module)
      groups[index].permissions.push(permission)
      return
    }

    groups.push({
      module,
      permissions: [permission],
    })

  })

  return groups
  .map(({module, permissions}) =>
  ({
    module: getModuleName(module),
    permissions
  }))
}