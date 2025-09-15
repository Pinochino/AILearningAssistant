import { setAccessToken } from '@/utils/AccessToken';
import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const AuthCallback = () => {

  const [searchParams, setSearchParams] = useSearchParams();
  const accessToken = searchParams.get('token')
  console.log(searchParams.get('token'))
  setAccessToken(accessToken)
  const navigate = useNavigate();

  useEffect(() => {
    if (accessToken) {
      navigate('/', {replace: true})
    }
  }, [])

  return (
    <div>AuthCallback</div>
  )
}

export default AuthCallback