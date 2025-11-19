import { transporter } from '../configs/emailConfig.js'
import { EmailInterface } from '~/types/EmailInterface.js'

const emailService = {
  sendEmail: async ({ from, to, html, text, subject, template }: EmailInterface) => {
    try {
      const mailOptions = {
        from,
        to,
        html,
        text,
        subject,
        template
      }

      const infor = await transporter.sendMail(mailOptions)
      console.log('Messge sent: ', infor.messageId)
    } catch (error: any) {
      throw new Error(error.message)
    }
  }
}
export default emailService
