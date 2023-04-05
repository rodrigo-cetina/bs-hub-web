import { Button, Form, Divider } from 'antd'
import Card from 'components/single/Card/Card'
import Modal from 'components/single/Modal/Modal'
import logo from 'assets/img/LOGOTIPO.svg'
import GoogleLogo from 'assets/img/Google__G__Logo.svg'
//import MS_Logo from 'assets/img/MS_Logo.svg'
import { Input } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import useAuth from 'hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { PATH_ROUTES } from 'routes/config/Paths'
import {
  LoginWithGoogle,
//  LoginWithMS,
  LoginWithEmailAndPassword,
  ILoginWithAuthResponse,
} from 'firebaseUtil/LoginWithFirebase'
import { useEffect } from 'react'

import './login.css'

interface LoginFormValues {
  email: string
  password: string
}

export default function Login() {
  const auth = useAuth()
  let navigate = useNavigate()

  const onLogin = async (values: LoginFormValues) => {
    loginWithAuth(()=>LoginWithEmailAndPassword(values))
  }

  /**
   * 
   * @param authMethod
   */
  async function loginWithAuth(authMethod: ()=>Promise<ILoginWithAuthResponse | string>) {
    const result:string|ILoginWithAuthResponse = await authMethod()

    if(typeof result === 'string'){
      Modal.error({
        title: 'Error de autenticación de proveedor',
        content: result,
      })
      return
    }

    await auth.loginWithOAuth(result)
    navigate(PATH_ROUTES.HOME)
  }

  useEffect(()=>{
    const { isLogged } = auth

    if(isLogged()){
      navigate(PATH_ROUTES.HOME)
    }
  }, [])

  return (
    <div className='login'>
      <div className='login-form'>
        <Card className='card_login'>
          <div className='card_logo'>
            <img src={logo} alt='logo khronox' />
            <div>Inicio de sesión</div>
          </div>
          <div className='card_form'>
            <Form name='normal_login' layout='vertical' onFinish={onLogin}>
              <Form.Item
                name='email'
                label='Usuario'
                rules={[
                  { required: true, message: 'Por favor ingrese su correo' },
                ]}
              >
                <Input
                  className='login_input'
                  suffix={<UserOutlined className='site-form-item-icon' />}
                />
              </Form.Item>
              <Form.Item
                label='Contraseña'
                name='password'
                rules={[
                  {
                    required: true,
                    message: 'Por favor ingrese su contraseña',
                  },
                ]}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item>
                <Button
                  className='btn btn_primary'
                  type='primary'
                  htmlType='submit'
                >
                  Iniciar sesión
                </Button>
              </Form.Item>

              <Divider>O</Divider>

              <Button
                icon={(
                  <span className='icon-login'>
                    <img src={GoogleLogo} alt='Logo de Google' />
                  </span>
                )}
                type='primary'
                className='btn btn_primary btn_google_access'
                onClick={()=>loginWithAuth(LoginWithGoogle)}
              >
                Continuar con Google
              </Button>

              <br />
              <br />
              {/*
              <Button
                icon={(
                  <span className='icon-login'>
                    <img src={MS_Logo} alt='Logo de Microsoft' />
                  </span>
                )}
                type='primary'
                className='btn btn_primary btn_google_access'
                onClick={()=>loginWithAuth(LoginWithMS)}
              >
                Continuar con Microsoft
              </Button>
              */}
            </Form>
          </div>
        </Card>
      </div>
    </div>
  )
}
