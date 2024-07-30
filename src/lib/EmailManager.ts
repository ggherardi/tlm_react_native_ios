// import email from 'react-native-email'
import Mailer from 'react-native-mail'

export const EmailManager = {
  send: (to: string[], subject: string, body: string, attachments?: any[]) => {
    Mailer.mail({
      subject: subject,
      recipients: to,
      body: body,
      // attachments: attachments,
      attachments: attachments
    }, (error, event) => {
      console.log("Mail sent?", error, event);
      if (error != undefined) {
        console.log("Cannot open default email app");
      }
    })
  }
}