import { useNavigate } from 'react-router-dom'
import { Button, Tooltip } from 'antd'
import { ButtonShape } from 'antd/lib/button'
import { ButtonHTMLType, ButtonType } from 'antd/lib/button/button'
import { SizeType } from 'antd/lib/config-provider/SizeContext'
import { To } from 'react-router-dom'
import { MouseEventHandler } from 'react'
import './Button.css'

export interface ButtonAntProps {
  url?: To
  disabled?: boolean
  htmlType?: ButtonHTMLType
  icon?: React.ReactNode
  loading?: boolean
  shape?: ButtonShape
  size?: SizeType
  type?: ButtonType
  onClick?: MouseEventHandler
  isRedirect?: boolean
  tooltip?: String
  text?: String
  onContextMenu?: MouseEventHandler
  bClassName?: String
}

function ButtonAnt(props: ButtonAntProps):JSX.Element {
  
  const navigate = useNavigate()

  const handleRedirect = () => {
    if(props.url !== undefined)
    navigate(props.url)
  }
  
  return (
      <Tooltip title={props.tooltip}>
        <Button
          className={`btn ${props.bClassName}`}
          disabled={props.disabled}
          htmlType={props.htmlType}
          icon={props.icon}
          loading={props.loading}
          shape={props.shape}
          size={props.size}
          type={props.type}
          onClick={(!props.isRedirect) ? props.onClick : handleRedirect}
          onContextMenu={props.onContextMenu}
        >
        {props.text}
      </Button>
      </Tooltip>
    )
}

ButtonAnt.defaultProps = {
  url: '',
  disabled: false,
  htmlType: 'button',
  icon: null,
  loading: false,
  //shape: '',
  size: 'middle',
  type: 'default',
  //onClick: null,
  isRedirect: false,
  tooltip: '',
  text: '',
  //onContextMenu: null,
  bClassName: ''
}

export { ButtonAnt }