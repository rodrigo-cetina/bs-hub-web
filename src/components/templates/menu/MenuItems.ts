import { PATH_ROUTES } from 'routes/config/Paths'
import React from 'react'

export interface MenuItem {
  title: string,
  to?: string,
  routes?: string[],
  children?: MenuItem[],
}

export interface ExtendedMenuItem extends MenuItem {
  key: React.Key
}

const items:MenuItem[] = [
  {
    title: 'Usuarios',
    to: PATH_ROUTES.USERS,
    routes: [
      PATH_ROUTES.CREATE_USER,
      PATH_ROUTES.UPDATE_USER,
    ]
  },
  {
    title: 'Servicios',
    to: PATH_ROUTES.SERVICES,
  },
  {
    title: 'Segmentación de usuarios',
    to: PATH_ROUTES.SEGMENTS,
    routes: [
      PATH_ROUTES.CREATE_SEGMENT,
      PATH_ROUTES.UPDATE_SEGMENT,
    ],
  },
  {
    title: 'Roles y permisos',
    to: PATH_ROUTES.ROLES,
  },
]

export default items