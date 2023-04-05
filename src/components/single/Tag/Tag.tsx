import { Tag as AntdTag } from 'antd'
import './Tag.css'

export interface TagProps {
  className?: string;
  closable?: boolean;
  closeIcon?: React.ReactNode;
  visible?: boolean;
  onClose?: (e: React.MouseEvent<HTMLElement>) => void;
  children?: React.ReactNode
}

export default function Tag ({
  children,
  ...props
}: TagProps) {
  return (
    <AntdTag {...props}>
      {children}
    </AntdTag>
  )
}