import { Modal } from 'antd'
import { ModalFuncProps } from 'antd'
import { CheckCircleFilled, CloseCircleFilled, WarningFilled } from '@ant-design/icons'
import './Modal.css'
import React, { CSSProperties } from 'react'

export interface ModalConfirmProps {
  title?: React.ReactNode
  content?: React.ReactNode
  onOk?: (...args: any[]) => any
  okText?: React.ReactNode
  onCancel?: (...args: any[]) => any
  cancelText?: React.ReactNode
  style?: CSSProperties
}

function confirm ({
  cancelText= 'Cancelar',
  okText= 'Aceptar',
  ...props
}: ModalConfirmProps) {
  return (
    Modal.confirm({
      title: props.title,
      content: <div className='content-box' style={{zIndex: 2000}}>{props.content}</div>,
      onOk: props.onOk,
      okText: okText,
      onCancel: props.onCancel,
      cancelButtonProps: {className: 'btn-cancel'},
        cancelText: cancelText,
      className: 'personal-modal confirm-personal-modal',
      style: props.style
    })
  )
}

export { confirm }

export interface ModalSuccessProps {
    title?: React.ReactNode
    content?: React.ReactNode
    icon?: React.ReactNode
    onOk?: (...args: any[]) => any
    okText?: React.ReactNode
}

function success ({
  okText= 'Aceptar',
  icon= <CheckCircleFilled />,
  ...props
}: ModalSuccessProps) {
  return (
    Modal.success({
      title: props.title,
      content: <>{icon} <br/> <div className='content-box'>{props.content}</div></>,
      icon: icon,
      onOk: props.onOk,
      okText: okText,
      className: 'personal-modal',
    })
  )
}

export { success }

export interface ErrorModalProps {
  title?: React.ReactNode
  content?: React.ReactNode
  icon?: React.ReactNode
  onOk?: (...args: any[]) => any
  okText?: React.ReactNode
}

function error ({
  okText= 'Aceptar',
  ...props
}: ErrorModalProps) {
  return (
    Modal.error({
      title: props.title,
      content: <>{props.icon} <br/> <div className='content-box'>{props.content}</div></>,
      icon: props.icon,
      centered: true,
      onOk: props.onOk,
      okText: okText,
      className:'personal-modal',
    })
  )
}

error.defaultProps = {
  icon: <CloseCircleFilled />,
}

export { error }

export interface ModalWarningProps {
  title?: React.ReactNode
  content?: React.ReactNode
  icon?: React.ReactNode
  onOk?: (...args: any[]) => any
  okText?: React.ReactNode
}

function warning ({
  okText= 'Aceptar',
  ...props
}: ModalWarningProps) {
  return (
    Modal.warning({
      title: props.title,
      content: <>{props.icon} <br/> <div className='content-box'>{props.content}</div></>,
      icon: props.icon,
      onOk: props.onOk,
      okText: okText,
      className:'personal-modal',
    })
  )
}

warning.defaultProps = {
  icon: <WarningFilled />
}

export { warning }

export interface GenericModalProps extends ModalFuncProps {
  children?: React.ReactNode | React.ReactNode[]
}

const modal = ({
  children,
  className,
  okText='Aceptar',
  cancelText='Cancelar',
  cancelButtonProps={
    className: 'btn-cancel',
  },
  ...rest
}: GenericModalProps) => {
  return (
    <Modal
      {...rest}
      okText={okText}
      cancelText={cancelText}
      cancelButtonProps={cancelButtonProps}
      className={`personal-modal ${className}`}
    >
      <div className='content-box'>
        {children}
      </div>
    </Modal>
  )
}

modal.confirm = confirm
modal.success = success
modal.error = error
modal.warning = warning
modal.default = Modal

export default modal