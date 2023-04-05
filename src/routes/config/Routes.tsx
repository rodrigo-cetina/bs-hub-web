import Login from 'pages/login/Login'
import { PATH_ROUTES } from './Paths'

import Users from 'pages/users/List'
import UserForm from 'pages/users/CreateEdit'

import UserTypes from 'pages/userTypes/List'
import UserTypesForm from 'pages/userTypes/CreateEdit'

import Roles from 'pages/roles/List'
import RolesForm from 'pages/roles/CreateEdit'

import Segments from 'pages/segments/List'
import SegmentsForm from 'pages/segments/CreateEdit'

import Services from 'pages/services/List'
import ServicesForm from 'pages/services/CreateEditV2'

import ServiceTypes from 'pages/serviceTypes/List'
import ServiceTypesForm from 'pages/serviceTypes/CreateEdit'

import Profile from 'pages/profile/List'
import ProfileForm from 'pages/profile/CreateEdit'

import Home from 'pages/Home'

export interface Route {
  exact: boolean
  element: React.ReactNode | JSX.Element
  path: string
  isPrivate: boolean
}

export const ROUTES:Route[] = [
  {
    exact: true,
    element: <Login />,
    path: PATH_ROUTES.LOGIN,
    isPrivate: false,
  },
  {
    exact: true,
    element: <Home />,
    path: PATH_ROUTES.HOME,
    isPrivate: true,
  },

  {
    exact: true,
    element: <Users />,
    path: PATH_ROUTES.USERS,
    isPrivate: true,
  },
  {
    exact: true,
    element: <UserForm />,
    path: PATH_ROUTES.CREATE_USER,
    isPrivate: true,
  },
  {
    exact: true,
    element: <UserForm />,
    path: PATH_ROUTES.UPDATE_USER,
    isPrivate: true,
  },

  {
    exact: true,
    element: <UserTypes />,
    path: PATH_ROUTES.USER_TYPES,
    isPrivate: true,
  },
  {
    exact: true,
    element: <UserTypesForm />,
    path: PATH_ROUTES.CREATE_USER_TYPE,
    isPrivate: true,
  },
  {
    exact: true,
    element: <UserTypesForm />,
    path: PATH_ROUTES.UPDATE_USER_TYPE,
    isPrivate: true,
  },

  {
     exact: true,
     element: <Roles />,
     path: PATH_ROUTES.ROLES,
     isPrivate: true,
  },
  {
    exact: true,
    element: <RolesForm />,
    path: PATH_ROUTES.CREATE_ROLE,
    isPrivate: true,
 },
 {
  exact: true,
  element: <RolesForm />,
  path: PATH_ROUTES.UPDATE_ROLE,
  isPrivate: true,
},

  {
    exact: true,
    element: <Segments />,
    path: PATH_ROUTES.SEGMENTS,
    isPrivate: true,
  },
  {
    exact: true,
    element: <SegmentsForm />,
    path: PATH_ROUTES.CREATE_SEGMENT,
    isPrivate: true,
  },
  {
    exact: true,
    element: <SegmentsForm />,
    path: PATH_ROUTES.UPDATE_SEGMENT,
    isPrivate: true,
  },
  {
    exact: true,
    element: <Services />,
    path: PATH_ROUTES.SERVICES,
    isPrivate: true,
  },
  {
    exact: true,
    element: <ServicesForm />,
    path: PATH_ROUTES.CREATE_SERVICE,
    isPrivate: true,
  },
  {
    exact: true,
    element: <ServicesForm />,
    path: PATH_ROUTES.UPDATE_SERVICE,
    isPrivate: true,
  },
  {
    exact: true,
    element: <ServiceTypes />,
    path: PATH_ROUTES.SERVICE_TYPES,
    isPrivate: true,
  },
  {
    exact: true,
    element: <ServiceTypesForm />,
    path: PATH_ROUTES.CREATE_SERVICE_TYPE,
    isPrivate: true,
  },
  {
    exact: true,
    element: <ServiceTypesForm />,
    path: PATH_ROUTES.UPDATE_SERVICE_TYPE,
    isPrivate: true,
  },

]