import Modal from 'components/single/Modal/Modal'
import { Image, Col, Row } from 'antd'
import { useState } from 'react'
import IconList, { IconListItem } from './IconList'
import './icon.css'

export interface ModalIconProps {
  visible: boolean
  onCancel: ()=>void
  onSelectIcon: (icon: string)=>void
}

export default function ModalIcon ({
  visible,
  onCancel,
  onSelectIcon,
}: ModalIconProps) {

  const [selected, setSelected] = useState<IconListItem | null>(null)

  //#region groupImages
  const length = IconList.length / 2

  const groups:IconListItem[][] = []

  let counter = 0
  let posCounter = 0
  let container:IconListItem[] = []

  IconList.forEach((IconListItemInstance, index)=>{
    if(posCounter > length)
    return

    if(counter === 6){
      groups.push([...container])
      container = []
      counter = 0
    }

    if(counter <= 5){
      container.push(IconListItemInstance)
    }

    if(index === (IconList.length-1)) {
      if(container.length > 0){
        groups.push(container)
      }
    }

    counter++
    posCounter++
  })

  return (
    <Modal
      visible={visible}
      onCancel={onCancel}
      title='Iconos predeterminados'
      onOk={()=>{
        if(selected !== null)
        onSelectIcon(selected.assetName)

        onCancel()
      }}
    >
        {groups.map((group, gIndex)=>(
          <Row key={gIndex} gutter={24}>
            {
              group.map((icon, index)=>(
                <Col
                  key={index}
                  span={4}
                  className={`
                    ${(selected?.assetName === icon.assetName) ? 'icon-selected' : ''}
                    icon-column
                  `}
                >
                  <div
                    className='icon-container'
                    onClick={()=>setSelected(icon)}
                  >
                    <Image
                      src={require(`assets/icons-modal/${icon.assetName}`)}
                      preview={false}
                    />
                  </div>
                </Col>
              ))
            }
          </Row>
        ))}
    </Modal>
  )
}

export {IconList}