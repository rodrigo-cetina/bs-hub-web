import { Input as InputAntd } from 'antd'
import { ChangeEventHandler } from 'react'
import './input.css'

export interface InputProps<T> {
  disabled: boolean
  id?: string
  maxLength?: number
  onChange?: ChangeEventHandler<T>
  prefix?: any
  showCount?: boolean
  size?: any
  subfix?: any
  type?: string
  value?: string
  onResize?: any
  placeholder?: string
}

function Input(props: InputProps<any>) {
  return (
    <InputAntd
      className='input-k'
      id={props.id}
      maxLength={props.maxLength}
      placeholder={props.placeholder}
      onChange={props.onChange}
      type={props.type}
      value={props.value}
    ></InputAntd>
  )
}

Input.defaultProps = {
  disabled: false,
  name: null,
  maxLength: null,
  onChange: null,
  prefix: null,
  showCount: false,
  size: null,
  subfix: null,
  type:'text',
  value: null,
  onResize: null,
  placeholder: '',
}

export default Input