export interface EmailInterface {
  from: string;
  to: string;
  text: string;
  subject: string;
  html?: string;
  attackment?: any;
}