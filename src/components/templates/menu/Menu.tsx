import { Menu as AntMenu } from 'antd'
import { MenuMode, ItemType } from 'rc-menu/lib/interface'
import MenuItems, { ExtendedMenuItem } from './MenuItems'
import { useNavigate } from 'react-router-dom'

interface MenuProps {
  mode?: MenuMode
  className?: string
}

export default function Menu ({
  mode,
  className,
}:MenuProps) {

  const navigate = useNavigate()

  function renderMenuItem ({
    key,
    title,
    to,
    routes,
    children
  }: ExtendedMenuItem):ItemType {
    if(children === undefined)
    return {
      key: key,
      label: title,
      onClick: to===undefined ? ()=>{}:()=>navigate(to),
    }

    return null
  }

  return (
    <AntMenu
      mode={mode}
      className={className}
      items={MenuItems.map((menuItem, index)=>(
        renderMenuItem({...menuItem, key: index})
      ))}
    />
  )
}