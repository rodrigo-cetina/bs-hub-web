import { ButtonAnt } from 'components/single/button/Button'
import { MouseEventHandler } from 'react'
import './FormFooter.css'

export interface FormFooterCancelButton {
  cancelText?: string
  onCancel?: MouseEventHandler
  isCancelRedirect?: boolean
  cancelBackUrl?: string
}

export interface FormFooterOkButton {
  okText?: string
  onOk?: MouseEventHandler
}

export interface FormFooterProps {
  cancelButton?: FormFooterCancelButton
  okButton?: FormFooterOkButton
}

function renderCancelButton (cancelButton?:FormFooterCancelButton){
  if(cancelButton !== undefined){
    const {
      cancelText,
      onCancel,
      isCancelRedirect,
      cancelBackUrl,
    } = cancelButton

    return (
      <ButtonAnt
        bClassName='btn-cancel'
        isRedirect={isCancelRedirect}
        url={cancelBackUrl}
        onClick={onCancel}
        text={cancelText}
      />
    )
  }
  return null
}

function renderOkButton (okButton?: FormFooterOkButton) {
  if(okButton !== undefined) {
    const {
      okText,
      onOk,
    } = okButton

    return (
      <ButtonAnt
        bClassName='ant-btn ant-btn-primary'
        text={okText}
        onClick={onOk}      
      />
    )
  }

  return null
}

export default function FormFooter ({
  cancelButton,
  okButton,
}: FormFooterProps) {
  
  const cancelBtn = renderCancelButton(cancelButton)
  const okBtn     = renderOkButton(okButton)

  return (
    <div className='FormFooter'>
      {cancelBtn}
      {okBtn}
    </div>
  )
}