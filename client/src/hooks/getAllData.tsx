import { useQuery } from '@tanstack/react-query'
import handleApi from '../api/handleApi'
import buildQuery from '../utils/buildQuery'

type orderType = 'asc' | 'desc'

interface IGetAllData {
  url: string
  search?: string
  order?: orderType
  limit?: number
  skip?: number
  sortBy?: string
  page?: number
}

export default function getAllData({ url, ...param }: IGetAllData) {
  const queryString = buildQuery(param)

  return useQuery({
    queryKey: ['getAllData', queryString],
    queryFn: () =>
      handleApi({
        url: `${url}?${queryString}`,
        method: 'GET',
        withCredentials: true,
      }),
  })
}
