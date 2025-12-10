/**
 * Type definitions for Emails feature
 * 
 * @module types/emails
 */

export interface EmailAddress {
  address: string
  name: string
}

export interface EmailAddressGroup {
  value: EmailAddress[]
  html: string
  text: string
}

export interface EmailHeaders {
  "delivered-to"?: string
  received?: string
  "x-forwarded-encrypted"?: string
  "x-google-smtp-source"?: string
  "x-received"?: string
  "arc-seal"?: string
  "arc-message-signature"?: string
  "arc-authentication-results"?: string
  "return-path"?: string
  "received-spf"?: string
  "authentication-results"?: string
  "x-spam-processed"?: string
  "x-mdarrival-date"?: string
  "x-authenticated-sender"?: string
  "x-return-path"?: string
  "x-envelope-from"?: string
  from: string
  to: string
  cc?: string
  references?: string
  "in-reply-to"?: string
  subject: string
  date: string
  "message-id": string
  "mime-version": string
  "content-type": string
  "x-mailer"?: string
  "thread-index"?: string
  "content-language"?: string
  "x-mdcfsigsadded"?: string
  "x-mailcontrol-outinfo"?: string
  "x-scanned-by"?: string
  "x-mailcontrol-refers-to"?: string
  "dkim-signature"?: string
  "x-msfbl"?: string
  "x-campaign-id"?: string
  "list-unsubscribe"?: string
  "x-message-id"?: string
  "x-feedback-id"?: string
  "reply-to"?: string
  "list-unsubscribe-post"?: string
  "feedback-id"?: string
  "x-sg-eid"?: string
  "x-entity-id"?: string
  "x-binding"?: string
  "x-marketoid"?: string
  "x-mailfrom"?: string
  "x-mktarchive"?: string
  "x-msys-api"?: string
  "x-mktmaildkim"?: string
  "x-mdaemon-deliver-to"?: string
}

export interface Email {
  id: string
  threadId: string
  labelIds: string[]
  sizeEstimate: number
  headers: EmailHeaders
  html: string
  text: string
  textAsHtml: string
  subject: string
  references: any
  date: string
  to: EmailAddressGroup
  from: EmailAddressGroup
  cc?: EmailAddressGroup
  messageId: string
  inReplyTo?: string
  replyTo?: EmailAddressGroup
}

export type EmailsResponse = Email[]

