import { useQuery } from "@tanstack/react-query"
import { handleApi } from "../api/handleApi"

export function GetUserInfor(id: string) {
  const getUserDetail = async () => {
    const res = await handleApi({
      url: `/users/detail/${id}`,
      method: 'GET',
      withCredentials: true
    })

    const result = await res.data;
    return result;
  }

  const { isPending, data, error, isLoading } = useQuery({
    queryKey: [`detail-infor-${id}`, id],
    queryFn: getUserDetail
  }
  )

  return {
    data,
    isPending,
    error,
    isLoading
  }
} 