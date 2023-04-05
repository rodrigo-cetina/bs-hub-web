import { Input } from 'antd'
import './Search.css'

export interface SearchProps {
  onSearch?: (value: string)=>void
  placeholder?: string
  loading?: boolean
}

export default function InputSearch ({
  onSearch,
  placeholder,
  loading,
}: SearchProps) {
  return (
    <Input.Search
      onSearch={onSearch}
      placeholder={placeholder}
      loading={loading}
      allowClear={true}
    />
  )
}