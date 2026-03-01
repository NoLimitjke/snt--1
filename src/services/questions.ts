'use server'

import { Client, Databases, Query, ID, Models } from 'node-appwrite'
import { DATABASE_ID, COLLECTIONS, getServerClient, Permissions } from '@/lib/appwrite'

export interface Question extends Models.Document {
  userId: string | null
  name: string
  email: string
  question: string
  isPrivate: boolean
  isPublished: boolean
  adminAnswer: string | null
  $createdAt: string
  $updatedAt: string
}

function getDatabases(apiKey: string) {
  const client = getServerClient(apiKey)
  return new Databases(client)
}

/**
 * Получить все вопросы для админ-панели с фильтрацией
 */
export async function getQuestions(
  page: number,
  limit: number,
  filters: {
    isPrivate?: boolean
    isPublished?: boolean
  },
  apiKey: string
): Promise<{ questions: Question[]; total: number; totalPages: number }> {
  const databases = getDatabases(apiKey)
  const skip = (page - 1) * limit

  const queries: string[] = [
    Query.limit(100),
    Query.orderDesc('$createdAt'),
  ]

  const response = await databases.listDocuments<Question>(
    DATABASE_ID,
    COLLECTIONS.QUESTIONS,
    queries
  )

  // Фильтрация на клиенте
  let filteredQuestions = response.documents

  if (filters.isPrivate !== undefined) {
    filteredQuestions = filteredQuestions.filter(q => q.isPrivate === filters.isPrivate)
  }

  if (filters.isPublished !== undefined) {
    filteredQuestions = filteredQuestions.filter(q => q.isPublished === filters.isPublished)
  }

  const total = filteredQuestions.length
  const totalPages = Math.ceil(total / limit)
  const paginatedQuestions = filteredQuestions.slice(skip, skip + limit)

  return {
    questions: paginatedQuestions,
    total,
    totalPages,
  }
}

/**
 * Получить опубликованные публичные вопросы для FAQ
 */
export async function getPublishedQuestions(
  page: number,
  limit: number,
  apiKey: string
): Promise<{ questions: Question[]; total: number; totalPages: number }> {
  const databases = getDatabases(apiKey)
  const skip = (page - 1) * limit

  const queries: string[] = [
    Query.limit(100),
    Query.orderDesc('$createdAt'),
    Query.equal('isPrivate', [false]),
    Query.equal('isPublished', [true]),
  ]

  const response = await databases.listDocuments<Question>(
    DATABASE_ID,
    COLLECTIONS.QUESTIONS,
    queries
  )

  const total = response.total
  const totalPages = Math.ceil(total / limit)
  const paginatedQuestions = response.documents.slice(skip, skip + limit)

  return {
    questions: paginatedQuestions,
    total,
    totalPages,
  }
}

/**
 * Получить вопрос по ID
 */
export async function getQuestionById(
  questionId: string,
  apiKey: string
): Promise<Question | null> {
  const databases = getDatabases(apiKey)

  try {
    const question = await databases.getDocument<Question>(
      DATABASE_ID,
      COLLECTIONS.QUESTIONS,
      questionId
    )
    return question
  } catch (error) {
    console.error('Error getting question by id:', error)
    return null
  }
}

/**
 * Создать новый вопрос
 */
export async function createQuestion(
  data: {
    userId: string | null
    name: string
    email: string
    question: string
    isPrivate: boolean
    isPublished?: boolean
  },
  apiKey: string
): Promise<Question> {
  const databases = getDatabases(apiKey)

  return await databases.createDocument<Question>(
    DATABASE_ID,
    COLLECTIONS.QUESTIONS,
    ID.unique(),
    {
      userId: data.userId,
      name: data.name,
      email: data.email,
      question: data.question,
      isPrivate: data.isPrivate,
      isPublished: data.isPublished ?? false,
      adminAnswer: null,
    },
    [Permissions.readAny]
  )
}

/**
 * Обновить вопрос (для админ-панели)
 */
export async function updateQuestion(
  questionId: string,
  data: {
    isPublished?: boolean
    adminAnswer?: string | null
  },
  apiKey: string
): Promise<Question> {
  const databases = getDatabases(apiKey)

  return await databases.updateDocument<Question>(
    DATABASE_ID,
    COLLECTIONS.QUESTIONS,
    questionId,
    data
  )
}

/**
 * Удалить вопрос
 */
export async function deleteQuestion(questionId: string, apiKey: string): Promise<void> {
  const databases = getDatabases(apiKey)

  await databases.deleteDocument(
    DATABASE_ID,
    COLLECTIONS.QUESTIONS,
    questionId
  )
}

/**
 * Отправка email через Resend
 */
export async function sendEmail(
  to: string,
  subject: string,
  text: string
): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY
  const emailFrom = process.env.EMAIL_FROM || 'СНТ №1 <onboarding@resend.dev>'

  if (!resendApiKey) {
    console.error('[EMAIL] RESEND_API_KEY not configured')
    throw new Error('Email service not configured')
  }

  const { Resend } = await import('resend')
  const resend = new Resend(resendApiKey)

  const { data, error } = await resend.emails.send({
    from: emailFrom,
    to,
    subject,
    text,
  })

  if (error) {
    console.error('[EMAIL] Failed to send email:', error)
    throw new Error(`Failed to send email: ${error.message}`)
  }

  console.log('[EMAIL] Email sent successfully:', data?.id)
}

/**
 * Отправить ответ на вопрос по email
 */
export async function sendQuestionAnswer(
  email: string,
  questionText: string,
  answerText: string | null
): Promise<void> {
  const subject = 'Ответ на ваш вопрос в СНТ №1'
  const text = `
Здравствуйте!

На ваш вопрос:
"${questionText}"

Получен ответ:
${answerText || 'Ответ будет предоставлен позже.'}

С уважением,
Администрация СНТ №1
  `.trim()

  await sendEmail(email, subject, text)
}
