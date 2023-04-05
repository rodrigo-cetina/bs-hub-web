import InputSearch from 'components/single/Input/Search'
import { ButtonAnt, ButtonAntProps } from 'components/single/button/Button'
import { MouseEventHandler } from 'react'
import { PlusOutlined } from '@ant-design/icons'
import './searchbar.css'
import { Select } from 'antd'

export interface AddButtonProps {
  isRedirect?: boolean
  onClick?: MouseEventHandler
  url?: string
  tooltip?: string
  disabled?: boolean
}
export interface DropDownProps {
  // isRedirect?: boolean
  onChange?: (value: string) => void
  data?: any[]
  tooltip?: string
  // disabled?: boolean
}

export interface SearchBarProps {
  onSearch?: (value: string) => void
  placeholder?: string
  addButton?: AddButtonProps
  additionalButtons?: ButtonAntProps[]
  loading?: boolean
  dropdowns?: DropDownProps[]

}

export default function SearchBar({
  onSearch,
  placeholder = 'Buscar',
  addButton,
  additionalButtons = [],
  loading,
  dropdowns = []
}: SearchBarProps) {
  return (
    <div className='searchbar'>
      <InputSearch
        onSearch={onSearch}
        placeholder={placeholder}
        loading={loading}
      />
      {
        (dropdowns && dropdowns.map(({ data, tooltip, onChange }) => (
          <Select
            style={{ width: "auto", margin: '0px 5px' }}
            size="middle"
            placeholder={`Seleccionar un ${tooltip}`}
            onChange={onChange}
            suffixIcon={null}
            allowClear={true}
          >
            {data?.map((item) => (
              <Select.Option value={item._id} key={item._id}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
        )))
      }
      {
        (addButton) ?
          <ButtonAnt
            key='addButtonKey'
            disabled={addButton.disabled}
            icon={<PlusOutlined />}
            isRedirect={addButton.isRedirect}
            url={addButton.url}
            onClick={addButton.onClick}
            tooltip={addButton.tooltip}
            bClassName='searchbar-btn'
          /> : null
      }
      {
        (additionalButtons && additionalButtons.map((buttonProps, index) => (
          <ButtonAnt
            key={index}
            {...buttonProps}
          />
        )))
      }

    </div>
  )
}