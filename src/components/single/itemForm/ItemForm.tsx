import { Form } from 'antd'
import { Rule } from 'antd/lib/form'
import { NamePath } from 'antd/lib/form/interface'

export interface ItemFormProps {
  name?: string
  label?: string
  rules?: Array<Rule>
  children?: any
  fieldKey?: React.Key | React.Key[]
  hasFeedback?: boolean
  dependencies?: Array<NamePath>
}

function ItemForm(props: ItemFormProps) {
  return (
    <Form.Item
      dependencies={props.dependencies}
      hasFeedback={props.hasFeedback}
      name={props.name}
      rules={props.rules}
      label={props.label}
      fieldKey={props.fieldKey}
    >
      {props.children}
    </Form.Item>
  )
}

ItemForm.defaultProps = {
  name: 'Defualt',
  label: '',
  rules: [],
  children: null,
  hasFeedback: false,
  dependencies: [],
}

export default ItemForm