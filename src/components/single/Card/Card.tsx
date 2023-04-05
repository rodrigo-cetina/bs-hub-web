import React from 'react'
import { Card as CardAntd } from 'antd'
import './card.css'

export interface CardProps {
  title?: String
  width?: number
  className? : String
  children?: JSX.Element | JSX.Element[]
}

function Card(props: CardProps){
  return (
    <CardAntd
      style={{ width: props.width }}
      className={`card ${props.className}`}
      title={props.title}
    >
      {props.children}
    </CardAntd>
  )
}

export default Card