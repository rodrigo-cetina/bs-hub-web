import { ButtonAnt } from 'components/single/button/Button'
import { EnterOutlined } from '@ant-design/icons'
import { MouseEventHandler } from 'react'
import './title.css'

type TitleType = 'main' | 'form' | 'expand'

interface BackProps {
  isRedirect?: boolean
  onClick?: MouseEventHandler
  url?: string
}

interface TitleProps {
  text?: string
  type?: TitleType
  backButton?: BackProps
}

export default function Title ({
  text,
  type = 'main',
  backButton,
}: TitleProps) {
  return (
    <div className={`title ${type}`}>
      {backButton !== undefined ?
        <ButtonAnt
          isRedirect={backButton.isRedirect}
          onClick={backButton.onClick}
          url={backButton.url}
          icon={<EnterOutlined />}
        />:null
      }

      {text}
    </div>
  )
}