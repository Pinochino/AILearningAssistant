import { transporter } from '~/configs/emailConfig'
import { EmailInterface } from '~/types/EmailInterface'

const emailService = {
  sendEmail: async ({ from, to, html, text, subject }: EmailInterface) => {
    const infor = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html: 'home'
    })
    console.log('Messge sent: ', infor.messageId)
  },

  sendEmailWithAttackment: async () => {}
}
export default emailService
