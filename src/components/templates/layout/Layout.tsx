import { useState } from 'react'
import Header from 'components/templates/header/Header'
import logo from 'assets/img/LOGOTIPO.svg'

export interface LayoutProps {
  children?: React.ReactNode| React.ReactNode[]
}

export default function Layout(props: LayoutProps) {
  const [collapse, setCollapse] = useState(false)

  const toggleCollapse = () => {
    setCollapse(!collapse)
  }

  return (
    <div style={{ width: 'calc(100vw -3mm)', height: '100vh' }}>
      <Header logo={logo} toggleCollapse={toggleCollapse} />
      {/* <Sidebar collapse={collapse} /> */}
      <main style={{paddingTop:'60px'}}>{props.children}</main>
    </div>
  )
}
