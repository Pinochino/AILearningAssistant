import { Button } from 'antd'
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCookies } from 'react-cookie'
import authService from '../../services/AuthService'
import { useAppDispatch } from '../../redux/hooks'
import WhisperWeb from '@/components/ui/speech_recognition/WhisperWeb'
import TextToSpeechClient from '@/components/ui/text-to-speech-client/TextToSpeechClient'
import ReactTranslator from '@/components/ui/multilingual_translation/ReactTranslator'

const HomePage = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [cookies, setCookie, removeCookie] = useCookies(['REFRESH_TOKEN'])

  // console.log(cookies.REFRESH_TOKEN)
  const handleLogout = async () => {
    const result = await dispatch(authService.logout())

    if (authService.logout.fulfilled.match(result)) {
      navigate('/auth/login', { replace: true })
    }
  }

  return (
    <div>
      HomePage
      <Button onClick={handleLogout}>Logout</Button>
     <TextToSpeechClient />
    </div>
  )
}

export default HomePage
