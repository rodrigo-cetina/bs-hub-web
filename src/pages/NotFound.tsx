import { useNavigate } from 'react-router-dom'
import { Result, Button } from 'antd'

export default function NotFound() {
  const navigate = useNavigate()
  const handleRedirect=()=>{
    navigate('/')
  }
  
  return (
    <Result
      status='404'
      title='404'
      subTitle='Perdón, la página que visito no existe.'
      extra={<Button onClick={()=>{handleRedirect()}} type='primary'>Regresar</Button>}
    />
  )
}
