import { useQuery } from '@tanstack/react-query';
import { handleApi } from '../api/handleApi';

interface IGetCountByName {
  name: string
}

export default function GetRoleCountByName(name: string) {

  console.log(name)

  const getCountRole = async () => {
    console.log(`/users/count-by-role/${name}`)
    try {
      const res = await handleApi({
        url: `/users/count-by-role/${name}`,
        method: 'GET',
        withCredentials: true
      })
      const result = await res.data;
      return result;
    } catch (e) {
      return { data: 0 } as any;
    }
  }

  const { isPending, error, data } = useQuery({
    queryKey: [`count-role-${name}`, name],
    queryFn: getCountRole,
    staleTime: 60_000,
    retry: 0,
  })

  return {
    isPending,
    error,
    data
  }
}