interface ModuleString {
  [key:string]:string
}

const moduleStrings:ModuleString = {}

moduleStrings['users'] = 'Usuarios'
moduleStrings['roles'] = 'Roles'
moduleStrings['userTypes'] = 'Tipos de usuario'
moduleStrings['serviceTypes'] = 'Tipos de servicio'
moduleStrings['services'] = 'Servicios'
moduleStrings['segments'] = 'Segmentación de usuarios'


export function getModuleName (module: string) {
  const mod = moduleStrings[module]

  if(mod !== undefined)
  return mod

  return module
}