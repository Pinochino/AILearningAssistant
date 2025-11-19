import { AxiosRequestConfig } from 'axios'
import axiosClient from './axiosClient'

type methodType = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

interface IHandleApi extends AxiosRequestConfig {
  url: string
  method: methodType
  data?: unknown
  params?: any
  headers?: Record<string, string>
  withCredentials?: boolean
}

export const handleApi = ({ url, method, data, ...props }: IHandleApi) => {
  return axiosClient({
    url,
    method,
    data,
    ...props
  })
}
