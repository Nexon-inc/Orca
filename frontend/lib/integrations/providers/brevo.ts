// lib/integrations/providers/brevo.ts
import * as SibApiV3Sdk from 'sib-api-v3-sdk'

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()

if (process.env.BREVO_API_KEY) {
  apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY)
}

export async function sendBrevoCampaign(params: {
  to: string
  subject: string
  htmlContent: string
  senderName: string
  senderEmail: string
}) {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()
  sendSmtpEmail.to = [{ email: params.to }]
  sendSmtpEmail.subject = params.subject
  sendSmtpEmail.htmlContent = params.htmlContent
  sendSmtpEmail.sender = {
    name: params.senderName,
    email: params.senderEmail
  }
  return apiInstance.sendTransacEmail(sendSmtpEmail)
}
