export interface EmailInterface {
  from: string
  to: string
  text?: string
  subject: string
  template?: string
  html?: string
  attackment?: any
  context?: any
}
