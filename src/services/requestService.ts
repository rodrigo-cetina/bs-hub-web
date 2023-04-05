import axios, { AxiosRequestHeaders } from 'axios'
import qs from 'qs'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface RequestServiceParams {
  url: string
  params?: {}
  payload?: {}
  method?: HttpMethod
  overrideHeaders?: AxiosRequestHeaders
}

export default async function requestService({
  url,
  params,
  payload,
  method,
  overrideHeaders,
}: RequestServiceParams) {

  const token = localStorage.getItem('jwt')
  const headers: AxiosRequestHeaders = {
    'Content-type': 'application/json',
  }
  if(token !== null){
    headers['Authorization'] = `Bearer ${token}`
  }  

  try {
    const { data } = await axios({
      url: url,
      method: method,
      baseURL: process.env.REACT_APP_URL_CONNECTION_API || 'http://localhost:5000/api/v1',
      headers: (overrideHeaders !== undefined) ? overrideHeaders : headers,
      params: params,
      paramsSerializer: function (params) {
        return qs.stringify(params, { arrayFormat: 'brackets' })
      },
      data: payload,
    })

    return data
  } catch (error) {
    throw error
  }
}
