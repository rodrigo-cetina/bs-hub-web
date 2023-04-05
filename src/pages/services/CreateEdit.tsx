import { Image } from 'antd';
import { IconList } from './ModalIcon';
import { elementKeyValue } from 'types/ServiceType';

/**Configuración de los parametros provenientes del tipo de servicio elegido */
export interface IConfig {
  key: string,
  value: Array<elementKeyValue> | string,
}

interface IConfigFromTypeService {
  [key: string]: 'array' | 'string'
}

export interface ChangeArrayItemParams {
  key: string
  index: number
  value: string
}

export function Label({value}:{value?:string}){
  return <label>{value}</label>
}

function RenderIcon ({value}:{value?:string}) {
  if(value === undefined)
  return (<></>)

  const IconItem = IconList.find(t => t.assetName === value)
  if(IconItem !== undefined)
  return (
    <Image 
      src={require(`assets/icons-modal/${IconItem.assetName}`)} 
      preview={false}
    />
  )

  return (<></>)
}