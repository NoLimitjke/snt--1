'use server'

import { Client, Databases, Query, ID, Permission, Role, Models } from 'node-appwrite'
import { DATABASE_ID, COLLECTIONS, getServerClient, Permissions } from '@/lib/appwrite'

export interface User extends Models.Document {
  email: string
  name: string | null
  image: string | null
  emailVerified: boolean
  role: 'ADMIN' | 'USER'
  isBanned: boolean
}

// Получение серверного клиента
function getDatabases(apiKey: string) {
  const client = getServerClient(apiKey)
  return new Databases(client)
}

/**
 * Получить пользователя по email
 */
export async function getUserByEmail(email: string, apiKey: string): Promise<User | null> {
  try {
    const databases = getDatabases(apiKey)
    const response = await databases.listDocuments<User>(
      DATABASE_ID,
      COLLECTIONS.USERS,
      [Query.equal('email', email), Query.limit(1)]
    )

    if (response.documents.length === 0) {
      return null
    }

    return response.documents[0]
  } catch (error) {
    console.error('Error getting user by email:', error)
    return null
  }
}

/**
 * Получить пользователя по ID
 */
export async function getUserById(userId: string, apiKey: string): Promise<User | null> {
  try {
    const databases = getDatabases(apiKey)
    return await databases.getDocument<User>(
      DATABASE_ID,
      COLLECTIONS.USERS,
      userId
    )
  } catch (error) {
    console.error('Error getting user by id:', error)
    return null
  }
}

/**
 * Создать нового пользователя
 */
export async function createUser(
  data: {
    email: string
    name?: string
    emailVerified?: boolean
    role?: 'ADMIN' | 'USER'
    isBanned?: boolean
  },
  apiKey: string
): Promise<User> {
  const databases = getDatabases(apiKey)
  
  return await databases.createDocument<User>(
    DATABASE_ID,
    COLLECTIONS.USERS,
    ID.unique(),
    {
      email: data.email,
      name: data.name || null,
      image: null,
      emailVerified: data.emailVerified ?? false,
      role: data.role || 'USER',
      isBanned: data.isBanned ?? false,
    },
    [Permissions.readAny, Permissions.writeUser(data.email)]
  )
}

/**
 * Обновить пользователя
 */
export async function updateUser(
  userId: string,
  data: {
    name?: string
    role?: 'ADMIN' | 'USER'
    isBanned?: boolean
    emailVerified?: boolean
  },
  apiKey: string
): Promise<User> {
  const databases = getDatabases(apiKey)
  
  return await databases.updateDocument<User>(
    DATABASE_ID,
    COLLECTIONS.USERS,
    userId,
    data
  )
}

/**
 * Удалить пользователя
 */
export async function deleteUser(userId: string, apiKey: string): Promise<void> {
  const databases = getDatabases(apiKey)
  
  await databases.deleteDocument(
    DATABASE_ID,
    COLLECTIONS.USERS,
    userId
  )
}

/**
 * Получить всех пользователей с пагинацией
 */
export async function getUsers(
  page: number,
  limit: number,
  apiKey: string
): Promise<{ users: User[]; total: number; totalPages: number; page: number }> {
  const databases = getDatabases(apiKey)
  const skip = (page - 1) * limit

  const [usersResponse, totalResponse] = await Promise.all([
    databases.listDocuments<User>(
      DATABASE_ID,
      COLLECTIONS.USERS,
      [
        Query.limit(limit),
        Query.offset(skip),
        Query.orderDesc('$createdAt'),
      ]
    ),
    databases.listDocuments<User>(
      DATABASE_ID,
      COLLECTIONS.USERS,
      [Query.limit(1)]
    ),
  ])

  return {
    users: usersResponse.documents,
    total: totalResponse.total,
    totalPages: Math.ceil(totalResponse.total / limit),
    page,
  }
}

/**
 * Получить количество постов и комментариев пользователя
 */
export async function getUserStats(userId: string, apiKey: string): Promise<{ posts: number; comments: number }> {
  const databases = getDatabases(apiKey)
  
  const [postsResponse, commentsResponse] = await Promise.all([
    databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.POSTS,
      [Query.equal('authorId', userId), Query.limit(1)]
    ),
    databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.COMMENTS,
      [Query.equal('authorId', userId), Query.limit(1)]
    ),
  ])

  // Получаем точное количество через отдельный запрос
  const postsCount = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.POSTS,
    [Query.equal('authorId', userId), Query.select(['$id'])]
  )

  const commentsCount = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.COMMENTS,
    [Query.equal('authorId', userId), Query.select(['$id'])]
  )

  return {
    posts: postsCount.total,
    comments: commentsCount.total,
  }
}
