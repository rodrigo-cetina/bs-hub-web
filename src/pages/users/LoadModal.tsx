import Modal from 'components/single/Modal/Modal'
import { ButtonAnt } from 'components/single/button/Button'
import { List } from 'antd'
import type { UploadProps } from 'antd'
import type { UploadFile, RcFile } from 'antd/lib/upload/interface'
import { Upload, Alert, AlertProps } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import requestService from 'services/requestService'
import { useState } from 'react'

export interface LoadModalProps {
  visible?: boolean
  toggle?: Function
  onLoadModal?: ()=>void
}

export default function LoadModal ({visible=false, toggle=()=>{}, onLoadModal}: LoadModalProps) {
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [uploading, setUploading] = useState(false)

  const [alerts, setAlerts] = useState<AlertProps[]>([])
  function pushToAlert (nextAlert: AlertProps) {
    setAlerts([nextAlert, ...alerts])
  }
  function removeAlert(index: number) {
    const nextAlerts = ([...alerts])
    nextAlerts.splice(0, 1, alerts[index])

    setAlerts([...nextAlerts])
  }

  function validExtension(files : any){
    let extensionsValid = ['text/csv'];
    if(extensionsValid.includes(files.type)){
      return true
    }
    return false
  }

  async function handleUpload () {
    try {
      const isValid = validExtension(fileList[0])
      if(!isValid){
        pushToAlert({
          message: 'Tipo de archivo no valido, Solo se aceptan archivos .csv',
          type: 'error',
        })
        setUploading(false)
        return 
      }
      const formData = new FormData()
      formData.append('file', fileList[0] as RcFile)
      setUploading(true)

       const res = await requestService({
        url: 'files/uploadFile',
        payload: formData,
        method: 'POST',
      })

      if(Array.isArray(res) && res.length > 0){
        pushToAlert({
          type: 'error',
          message: (
            <List
              header='No se pudieron crear los usuarios con los id de origen:'
            >
              {res.map((item:string, index)=>(
                <List.Item title={item} key={index}>
                  <List.Item.Meta title={item}></List.Item.Meta>
                </List.Item>
              ))}
            </List>      
          )
        })
      }

      if(Array.isArray(res) && res.length === 0){
        if(toggle !== undefined)
        toggle()

        Modal.success({
          title: 'Usuarios agregados',
          content: 'Los usuarios se crearon correctamente',
        })
      }

      if(onLoadModal !== undefined)
      onLoadModal()

      setUploading(false)

    } catch (err: any){
      //message.error('Fallo la carga')
      pushToAlert({
        message: 'Fallo la carga del archivo',
        type: 'error',
      })
      setUploading(false)
    }
  }

  const props: UploadProps = {
    accept: '.csv',
    
    onRemove: file => {
      const index = fileList.indexOf(file)
      const newFileList = fileList.slice()
      newFileList.splice(index, 1)
      setFileList(newFileList)
    },

    beforeUpload: function (file) {
      setFileList([file])
      return false
    },

    fileList,
  }

  return (
    <Modal
      visible={visible}
      onCancel={()=>{
        toggle()
        setFileList([])
      }}
      okButtonProps={{
        disabled: (fileList.length === 0),
        onClick: ()=>handleUpload(),
        loading: uploading,
      }}
    >
      {alerts.map((alert, index)=>
        <Alert
          {...alert}
          closable={true}
          onClose={()=>removeAlert(index)}
        />
      )}
      {alerts.length > 0 && <br />}
      <Upload {...props}>
        <ButtonAnt
          icon={<UploadOutlined />}
          text='Seleccionar archivo'
          disabled={fileList.length > 0}
        />
      </Upload>
    </Modal>
  )
}