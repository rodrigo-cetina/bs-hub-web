import { Outlet, useNavigate } from 'react-router-dom'
import useAuth from 'hooks/useAuth'
import Layout from 'components/templates/layout/Layout'
import { useState, useEffect } from 'react'

export interface ProtectedRouteProps {
  redirectPath: string
  redirectText: string
  children?: React.ReactNode | React.ReactNode[]
}

function ProtectedRoute({redirectPath, redirectText, children}: ProtectedRouteProps):JSX.Element | null {
  
  const auth = useAuth()
  const navigate = useNavigate()

  const [logged, setLogged] = useState(false)
  
  useEffect(()=>{
    const _logged = auth.isLogged()
    setLogged(_logged)

    if(!_logged)
    navigate(redirectPath)
  }, [auth.authUser])

  if(logged)
  return (
    <Layout>
      <Outlet />
    </Layout>
  )

  return null
}

ProtectedRoute.defaultProps = {
  redirectPath: '/login',
}

export default ProtectedRoute
