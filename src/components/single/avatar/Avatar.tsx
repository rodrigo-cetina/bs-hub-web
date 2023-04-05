import {
  Avatar as AntAvatar,
  Dropdown,
  Menu,
} from 'antd'
import useAuth from 'hooks/useAuth'
import './avatar.css'

function getChars(name: string) {
  let output = ''
  name.split(' ')
      .forEach((str, index)=>{
        if(index < 2)
        output = output + str.charAt(0)
      })
  return output
}

export default function Avatar () {
  const auth = useAuth()

  const { photoUrl } = auth

  const { names, lastNames,email } =( auth.authUser !== null) ? auth.authUser : { names: '', lastNames: '',email:''}
  const name = `${names.charAt(0)} ${lastNames.charAt(0)}`

  const menuItems = []

  if(auth.authUser !== null){
    menuItems.push(
      {
        key:'fullName',
        label:`${names} ${lastNames}`
      },
      {
        key: 'email',
        label: `${email}`,
      },
      {
      key: 'logout',
      onClick: () => {auth.logout()},
      label: (
        <span onClick={()=>auth.logout()}>
          Salir
        </span>
      ),
    },
    )
  }

  const menu = (
    <Menu items={menuItems} />
  )

  if(auth.authUser === null)
  return null

  if(menuItems.length > 0)
  return (
    <Dropdown overlay={menu} placement='bottom'>
      <AntAvatar className='bp_avatar' src={photoUrl}>
        {getChars(name)}
      </AntAvatar>
    </Dropdown>
  )

  return (
  <AntAvatar className='bp_avatar'>
    {getChars(name)}
  </AntAvatar>
  )
}