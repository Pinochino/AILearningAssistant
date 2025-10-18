import { useQuery } from "@tanstack/react-query";
import { handleApi } from "../api/handleApi";

interface IGetAllData {
  url: string;
  name: string;
  params?: string;
}

export function GetAllData({ url, name, params }: IGetAllData) {

  const { isPending, error, data, isLoading } = useQuery({
    queryKey: [`${name}`, params],
    queryFn: async () => {
      const res = await handleApi({ url: `${url}`, method: 'GET', withCredentials: true })
      const result = await res.data;
      return result;
    }
  })

  return {
    isPending,
    isLoading,
    data,
    error
  };
}