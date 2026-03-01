import { headers } from 'next/headers'
import { cookies } from 'next/headers'
import { Client, Account, Databases, Query, Models, ID, Permission, Role } from 'node-appwrite'
import { DATABASE_ID, COLLECTIONS, getServerClient, Permissions } from '@/lib/appwrite'
import type { User } from '@/services/users'

export interface Session {
  user: {
    id: string
    email: string
    name: string | null
    role: 'ADMIN' | 'USER'
    isBanned: boolean
  }
  expiresAt: string
}

// Интерфейс для документа сессии в Appwrite
interface SessionDocument extends Models.Document {
  $id: string
  $createdAt: string
  $updatedAt: string
  userId: string
  token: string
  expiresAt: string
  ipAddress: string | null
  userAgent: string | null
}

/**
 * Получить API ключ из переменных окружения
 */
function getApiKey(): string {
  const apiKey = process.env.APPWRITE_API_KEY
  if (!apiKey) {
    throw new Error('APPWRITE_API_KEY is not set')
  }
  return apiKey
}

/**
 * Получить сессию из cookies
 */
export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('appwrite-session')

    if (!sessionCookie?.value) {
      return null
    }

    // Получаем сессию из базы данных используя API ключ
    const apiKey = getApiKey()
    const client = getServerClient(apiKey)
    const databases = new Databases(client)

    // Ищем сессию по токену без фильтрации по дате (фильтруем вручную)
    const sessions = await databases.listDocuments<SessionDocument>(
      DATABASE_ID,
      COLLECTIONS.SESSIONS,
      [Query.equal('token', sessionCookie.value), Query.limit(100)]
    )

    if (sessions.documents.length === 0) {
      return null
    }

    // Находим валидную сессию с неистекшим сроком
    const now = new Date().toISOString()
    const sessionDoc = sessions.documents.find(s => s.expiresAt > now)

    if (!sessionDoc) {
      return null
    }

    // Получаем пользователя
    const user = await databases.getDocument<User>(
      DATABASE_ID,
      COLLECTIONS.USERS,
      sessionDoc.userId
    )

    if (user.isBanned) {
      return null
    }

    return {
      user: {
        id: user.$id,
        email: user.email,
        name: user.name,
        role: user.role as 'ADMIN' | 'USER',
        isBanned: user.isBanned,
      },
      expiresAt: sessionDoc.expiresAt,
    }
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}

/**
 * Получить текущего пользователя
 */
export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession()
  if (!session) {
    return null
  }

  const apiKey = getApiKey()
  const client = getServerClient(apiKey)
  const databases = new Databases(client)

  try {
    return await databases.getDocument<User>(
      DATABASE_ID,
      COLLECTIONS.USERS,
      session.user.id
    )
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

/**
 * Проверка, является ли пользователь администратором
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === 'ADMIN'
}

/**
 * Проверка, забанен ли пользователь
 */
export async function isBanned(): Promise<boolean> {
  const session = await getSession()
  return session?.user.isBanned === true
}

/**
 * Требуется аутентификация
 */
export async function requireAuth(): Promise<Session> {
  const session = await getSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}

/**
 * Требуется роль администратора
 */
export async function requireAdmin(): Promise<Session> {
  const session = await requireAuth()
  if (session.user.role !== 'ADMIN') {
    throw new Error('Forbidden')
  }
  return session
}

/**
 * Создать сессию для пользователя
 */
export async function createSession(userId: string): Promise<string> {
  const apiKey = getApiKey()
  const client = getServerClient(apiKey)
  const databases = new Databases(client)

  // Генерируем уникальный токен
  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 дней

  await databases.createDocument(
    DATABASE_ID,
    COLLECTIONS.SESSIONS,
    ID.unique(),
    {
      userId,
      token,
      expiresAt: expiresAt.toISOString(),
      ipAddress: null,
      userAgent: null,
    },
    [
      Permissions.readSession(userId),
      Permissions.writeSession(userId),
      Permissions.readAny, // Разрешаем чтение серверу
    ]
  )

  return token
}

/**
 * Удалить сессию
 */
export async function deleteSession(token: string): Promise<void> {
  const apiKey = getApiKey()
  const client = getServerClient(apiKey)
  const databases = new Databases(client)

  const sessions = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.SESSIONS,
    [Query.equal('token', token), Query.limit(1)]
  )

  if (sessions.documents.length > 0) {
    await databases.deleteDocument(
      DATABASE_ID,
      COLLECTIONS.SESSIONS,
      sessions.documents[0].$id
    )
  }
}
