import { Result } from 'antd'
import React from 'react'

export interface UnauthorizedProps {
  children?: React.ReactNode | React.ReactNode[]
}

export default function Unauthorized ({children}: UnauthorizedProps) {
  return (
    <Result
      status={403}
      title={'No autorizado'}
      subTitle='No autorizado para ver esta sección'
    >
      {children}
    </Result>
  )
}