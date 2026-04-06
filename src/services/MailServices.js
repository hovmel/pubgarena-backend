import nodemailer from 'nodemailer';
import { ENV } from '../helpers/constants';
import mailHtml from '../helpers/mailHtml';

const {
  SMTP_PORT, SMTP_HOST, SMTP_USER, SMTP_PASSWORD, SMTP_FROM,
} = ENV;

class MailServices {
  constructor() {
    if (SMTP_HOST && SMTP_USER && SMTP_PASSWORD) {
      this.transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASSWORD,
        },
      });
    }
  }

  sendConfirmationCode = async (code, to) => {
    const from = SMTP_FROM || SMTP_USER;
    if (!this.transporter) {
      console.warn('[MailServices] SMTP не настроен — письмо не отправлено. Код:', code, '→', to);
      return;
    }
    await this.transporter.sendMail({
      from,
      to,
      subject: 'Код подтверждения PubgArena',
      text: `Код подтверждения: ${code}`,
      html: mailHtml(code),
    });
  };
}

export default new MailServices();
