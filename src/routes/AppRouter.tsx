import { Routes, Route } from 'react-router-dom'
import { PATH_ROUTES } from './config/Paths'
import { ROUTES } from 'routes/config/Routes'
import ProtectedRoute from './ProtectedRoute'
import NotFound from 'pages/NotFound'

export default function AppRouter () {
  return (
    <Routes>
      {
        ROUTES
        .filter(t => !t.isPrivate)
        .map(({path, element}, index) => (
          <Route
            key={`private${index}`}
            path={path}
            element={element}
          />
        ))
      }

      <Route
        element={(
          <ProtectedRoute
            redirectPath={PATH_ROUTES.LOGIN}
            redirectText='Acceder'
          />
        )}
      >
        <Route
          key='home'
          path=''
          element={<></>}
        />
        {
          ROUTES
          .filter(t => t.isPrivate)
          .map(({path, element}, index) => (
            <Route
              key={index}
              path={path}
              element={element}
            />
          ))
        }
      </Route>
      
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}