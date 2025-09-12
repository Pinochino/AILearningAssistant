import { useSearchParams } from 'react-router-dom'

export default function useQueryString() {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchParamsObject = Object.fromEntries([...searchParams])

  return searchParamsObject.toString()
}
