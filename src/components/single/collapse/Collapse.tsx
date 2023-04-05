import { Collapse as AntCollapse, CollapseProps } from 'antd'
import { PlusOutlined, MinusOutlined } from '@ant-design/icons'
import './Collapse.css'

function Collapse ({
  children,
  expandIconPosition='end',
  expandIcon=(({isActive})=>isActive?<MinusOutlined />:<PlusOutlined/>),
  ...props
}: CollapseProps) {
  return (
    <AntCollapse {...props} expandIconPosition='end' expandIcon={({isActive})=>isActive ? <MinusOutlined />:<PlusOutlined />}>
      {children}
    </AntCollapse>
  ) 
}

Collapse.Panel = AntCollapse.Panel

export default Collapse