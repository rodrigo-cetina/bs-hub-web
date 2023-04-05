import './header.css'

import Menu from 'components/templates/menu/Menu'
import Avatar from 'components/single/avatar/Avatar'

export interface HeaderProps {
  logo?: string
  toggleCollapse?: Function
}

export default function Header(props: HeaderProps) {
  return (
    <header className='header'>
      <div className='header_logo'>
        <img src={props.logo} alt='logo-khronox' />
        {/* <Button
          onClick={toggleCollapse}
          icon={<Burger />}
          bClassName='menu-burger'
        /> */}
      </div>
      <Menu mode='horizontal' className='header_menu' />
      <Avatar />
      {/* <AvatarMenu menu={menu} fullName='Manuel Uicab' /> */}
    </header>
  )
}
