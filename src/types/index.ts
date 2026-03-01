import type { Models } from 'node-appwrite'

/**
 * Тип сессии пользователя Appwrite
 */
export interface Session {
  $id: string
  $userId: string
  $createdAt: string
  $updatedAt: string
  ip: string
  operatingSystem: string
  deviceType: string
  provider: string
  providerUid: string
  active: boolean
  expires: string
  lastActivity: string
  factors: string[]
  mfa: boolean
  lastActivityCountry: string
  lastActivityCity: string
  lastActivityLocation: {
    country: string
    city: string
  }
}

/**
 * Тип пользователя для сессии
 */
export interface UserSession {
  $id: string
  email: string
  name: string | null
  role?: string
  isBanned?: boolean
}

/**
 * Тип для данных сессии (response из getSession)
 */
export interface SessionData {
  user: UserSession
  session: Session | null
}

/**
 * Тип для ошибки Appwrite
 */
export interface AppwriteError extends Error {
  code: number
  message: string
  response: string
}

/**
 * Тип для документа пользователя
 */
export interface UserDocument extends Models.Document {
  email: string
  name: string | null
  image: string | null
  emailVerified: boolean
  role: string
  isBanned: boolean
}

/**
 * Тип для документа поста
 */
export interface PostDocument extends Models.Document {
  title: string
  content: string
  tags: string[]
  authorId: string
}

/**
 * Тип для документа комментария
 */
export interface CommentDocument extends Models.Document {
  content: string
  postId: string
  parentId?: string | null
  authorId: string
}

/**
 * Тип для авторизованной сессии (с данными пользователя)
 */
export interface AuthSession {
  user: {
    id: string
    email: string
    name: string | null
  }
  session: Session | null
}
