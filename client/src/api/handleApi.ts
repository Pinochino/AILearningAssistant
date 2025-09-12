import { AxiosRequestConfig } from 'axios'
import axiosClient from './axiosClient.js'

type methodType = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface IHandleApi extends AxiosRequestConfig {
  url: string
  method: methodType
  data?: any
}

const handleApi = ({ url, method = 'GET', data, ...props }: IHandleApi) => {
  return axiosClient({
    url,
    method,
    data,
    ...props
  })
}
export default handleApi
