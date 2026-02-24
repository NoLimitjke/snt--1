'use server'

import { Databases, Query, ID, Models } from 'node-appwrite'
import { DATABASE_ID, COLLECTIONS, getServerClient, Permissions } from '@/lib/appwrite'

export interface Comment extends Models.Document {
  content: string
  authorId: string
  postId: string
  parentId: string | null
}

export interface CommentWithAuthor extends Comment {
  author: {
    id: string
    name: string | null
    email: string
  }
}

export interface CommentWithReplies extends CommentWithAuthor {
  replies: CommentWithReplies[]
  likesCount?: number
}

function getDatabases(apiKey: string) {
  const client = getServerClient(apiKey)
  return new Databases(client)
}

/**
 * Создать комментарий
 */
export async function createComment(
  data: {
    content: string
    postId: string
    authorId: string
    parentId?: string | null
  },
  apiKey: string
): Promise<Comment> {
  const databases = getDatabases(apiKey)

  return await databases.createDocument<Comment>(
    DATABASE_ID,
    COLLECTIONS.COMMENTS,
    ID.unique(),
    {
      content: data.content,
      postId: data.postId,
      authorId: data.authorId,
      parentId: data.parentId || null,
    },
    [Permissions.readAny, Permissions.writeUser(data.authorId)]
  )
}

/**
 * Получить комментарий по ID
 */
export async function getCommentById(
  commentId: string,
  apiKey: string
): Promise<Comment | null> {
  const databases = getDatabases(apiKey)

  try {
    return await databases.getDocument<Comment>(
      DATABASE_ID,
      COLLECTIONS.COMMENTS,
      commentId
    )
  } catch (error) {
    console.error('Error getting comment:', error)
    return null
  }
}

/**
 * Удалить комментарий
 */
export async function deleteComment(
  commentId: string,
  apiKey: string
): Promise<void> {
  const databases = getDatabases(apiKey)

  await databases.deleteDocument(
    DATABASE_ID,
    COLLECTIONS.COMMENTS,
    commentId
  )
}

/**
 * Получить количество лайков комментария
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
