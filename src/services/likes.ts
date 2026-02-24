'use server'

import { Databases, Query, ID, Models } from 'node-appwrite'
import { DATABASE_ID, COLLECTIONS, getServerClient, Permissions } from '@/lib/appwrite'

export interface Like extends Models.Document {
  userId: string
  postId: string | null
  commentId: string | null
}

function getDatabases(apiKey: string) {
  const client = getServerClient(apiKey)
  return new Databases(client)
}

/**
 * Проверить, есть ли лайк у пользователя
 */
export async function getUserLike(
  userId: string,
  postId: string | null,
  commentId: string | null,
  apiKey: string
): Promise<Like | null> {
  const databases = getDatabases(apiKey)

  const queries: string[] = [Query.equal('userId', userId)]

  if (postId) {
    queries.push(Query.equal('postId', postId))
  }

  if (commentId) {
    queries.push(Query.equal('commentId', commentId))
  }

  const response = await databases.listDocuments<Like>(
    DATABASE_ID,
    COLLECTIONS.LIKES,
    queries
  )

  return response.documents[0] || null
}

/**
 * Создать лайк
 */
export async function createLike(
  data: {
    userId: string
    postId?: string | null
    commentId?: string | null
  },
  apiKey: string
): Promise<Like> {
  const databases = getDatabases(apiKey)

  return await databases.createDocument<Like>(
    DATABASE_ID,
    COLLECTIONS.LIKES,
    ID.unique(),
    {
      userId: data.userId,
      postId: data.postId || null,
      commentId: data.commentId || null,
    },
    [Permissions.readAny, Permissions.writeUser(data.userId)]
  )
}

/**
 * Удалить лайк
 */
export async function deleteLike(likeId: string, apiKey: string): Promise<void> {
  const databases = getDatabases(apiKey)

  await databases.deleteDocument(
    DATABASE_ID,
    COLLECTIONS.LIKES,
    likeId
  )
}

/**
 * Получить количество лайков для поста
 */
export async function getPostLikesCount(
  postId: string,
  apiKey: string
): Promise<number> {
  const databases = getDatabases(apiKey)

  const response = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.LIKES,
    [Query.equal('postId', postId), Query.select(['$id'])]
  )

  return response.total
}

/**
 * Получить количество лайков для комментария
 */
export async function getCommentLikesCount(
  commentId: string,
  apiKey: string
): Promise<number> {
  const databases = getDatabases(apiKey)

  const response = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.LIKES,
    [Query.equal('commentId', commentId), Query.select(['$id'])]
  )

  return response.total
}

/**
 * Переключить лайк (создать или удалить)
 */
export async function toggleLike(
  data: {
    userId: string
    postId?: string | null
    commentId?: string | null
  },
  apiKey: string
): Promise<{ liked: boolean; likesCount: number; likeId?: string }> {
  const databases = getDatabases(apiKey)

  const existingLike = await getUserLike(
    data.userId,
    data.postId || null,
    data.commentId || null,
    apiKey
  )

  if (existingLike) {
    // Удаляем лайк
    await deleteLike(existingLike.$id, apiKey)

    // Получаем новое количество лайков
    let likesCount = 0
    if (data.postId) {
      likesCount = await getPostLikesCount(data.postId, apiKey)
    } else if (data.commentId) {
      likesCount = await getCommentLikesCount(data.commentId, apiKey)
    }

    return { liked: false, likesCount }
  } else {
    // Создаем лайк
    const like = await createLike(
      {
        userId: data.userId,
        postId: data.postId,
        commentId: data.commentId,
      },
      apiKey
    )

    // Получаем количество лайков
    let likesCount = 0
    if (data.postId) {
      likesCount = await getPostLikesCount(data.postId, apiKey)
    } else if (data.commentId) {
      likesCount = await getCommentLikesCount(data.commentId, apiKey)
    }

    return { liked: true, likesCount, likeId: like.$id }
  }
}
