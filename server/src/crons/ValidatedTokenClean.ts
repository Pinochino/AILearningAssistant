import cron from 'node-cron'
import authService from '~/services/authService'

console.log('CleanToken cron file loaded')

cron.schedule('* * * * *', async () => {
  console.log('Cron is running to delete old token ....')
  await authService.cleanUpTokens()
})
