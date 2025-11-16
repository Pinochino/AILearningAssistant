import cron from 'node-cron'
import authService from '~/services/authService.js'

console.log('ForgotPassword cron file loaded')

cron.schedule('* * * * *', async () => {
  console.log('Cron is running to delete old token ....')
  await authService.cleanUpOtps()
})
