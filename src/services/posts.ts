'use server'

import { Client, Databases, Query, ID, Models } from 'node-appwrite'
import { DATABASE_ID, COLLECTIONS, getServerClient, Permissions } from '@/lib/appwrite'
import type { User } from '@/services/users'
import type { CommentWithReplies } from '@/services/comments'

export interface Post extends Models.Document {
  title: string
  content: string
  tags: string[]
  authorId: string
}

export interface PostWithAuthor extends Post {
  author: {
    id: string
    name: string | null
    email: string
  }
}

export interface PostWithCounts extends PostWithAuthor {
  likesCount: number
  commentsCount: number
}

function getDatabases(apiKey: string) {
  const client = getServerClient(apiKey)
  return new Databases(client)
}

/**
 * Получить список постов с пагинацией и фильтрами
 */
export async function getPosts(
  page: number,
  limit: number,
  filters: {
    tag?: string
    search?: string
  },
  apiKey: string
): Promise<{ posts: PostWithCounts[]; total: number; totalPages: number }> {
  const databases = getDatabases(apiKey)
  const skip = (page - 1) * limit

  const queries: string[] = [
    Query.limit(100), // Загружаем больше для фильтрации на клиенте
    Query.orderDesc('$createdAt'),
  ]

  if (filters.tag && filters.tag !== 'ВСЕ') {
    queries.push(Query.contains('tags', [filters.tag]))
  }

  const postsResponse = await databases.listDocuments<Post>(
    DATABASE_ID,
    COLLECTIONS.POSTS,
    queries
  )

  // Фильтрация по поиску (case-insensitive)
  let filteredPosts = postsResponse.documents
  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filteredPosts = postsResponse.documents.filter((post) =>
      post.title.toLowerCase().includes(searchLower) ||
      post.content.toLowerCase().includes(searchLower)
    )
  }

  // Применяем пагинацию после фильтрации
  const total = filteredPosts.length
  const totalPages = Math.ceil(total / limit)
  const paginatedPosts = filteredPosts.slice(skip, skip + limit)

  // Получаем количество лайков и комментариев для каждого поста
  const postsWithCounts = await Promise.all(
    paginatedPosts.map(async (post) => {
      const [likesCount, commentsCount] = await Promise.all([
        databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.LIKES,
          [Query.equal('postId', post.$id), Query.select(['$id'])]
        ),
        databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.COMMENTS,
          [Query.equal('postId', post.$id), Query.select(['$id'])]
        ),
      ])

      // Получаем автора, если authorId валиден
      let author = { id: '', name: null as string | null, email: 'Unknown' }
      if (post.authorId && /^[a-zA-Z0-9_]+$/.test(post.authorId) && post.authorId.length <= 36) {
        try {
          const authorDoc = await databases.getDocument<User>(
            DATABASE_ID,
            COLLECTIONS.USERS,
            post.authorId
          )
          author = {
            id: authorDoc.$id,
            name: authorDoc.name,
            email: authorDoc.email,
          }
        } catch (error) {
          console.warn('Could not fetch author:', post.authorId, error)
        }
      }

      return {
        ...post,
        author,
        likesCount: likesCount.total,
        commentsCount: commentsCount.total,
      }
    })
  )

  return {
    posts: postsWithCounts,
    total,
    totalPages,
  }
}

/**
 * Получить пост по ID с комментариями и лайками
 */
export async function getPostById(
  postId: string,
  apiKey: string
): Promise<PostWithCounts & { comments: CommentWithReplies[] } | null> {
  const databases = getDatabases(apiKey)

  try {
    const post = await databases.getDocument<Post>(
      DATABASE_ID,
      COLLECTIONS.POSTS,
      postId
    )

    // Получаем количество лайков
    const likesCount = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.LIKES,
      [Query.equal('postId', postId), Query.select(['$id'])]
    )

    // Получаем автора, если authorId валиден
    let author = { id: '', name: null as string | null, email: 'Unknown' }
    if (post.authorId && /^[a-zA-Z0-9_]+$/.test(post.authorId) && post.authorId.length <= 36) {
      try {
        const authorDoc = await databases.getDocument<User>(
          DATABASE_ID,
          COLLECTIONS.USERS,
          post.authorId
        )
        author = {
          id: authorDoc.$id,
          name: authorDoc.name,
          email: authorDoc.email,
        }
      } catch (error) {
        console.warn('Could not fetch author:', post.authorId, error)
      }
    }

    // Получаем корневые комментарии (без родителей)
    const rootComments = await getCommentsByPostId(postId, null, apiKey)

    return {
      ...post,
      author,
      likesCount: likesCount.total,
      commentsCount: rootComments.reduce(
        (acc, c) => acc + 1 + (c.replies?.length || 0),
        0
      ),
      comments: rootComments,
    }
  } catch (error) {
    console.error('Error getting post by id:', error)
    return null
  }
}

/**
 * Получить комментарии поста
 */
export async function getCommentsByPostId(
  postId: string,
  parentId: string | null,
  apiKey: string
): Promise<CommentWithReplies[]> {
  const databases = getDatabases(apiKey)

  const queries: any[] = [
    Query.equal('postId', postId),
    Query.orderAsc('$createdAt'),
  ]

  // Добавляем фильтр по parentId
  // В Appwrite null значения хранятся как пустые строки или отдельным флагом
  if (parentId !== null) {
    queries.push(Query.equal('parentId', [parentId]))
  } else {
    // Для корневых комментариев - пустой массив или специальное значение
    // Appwrite не поддерживает null, поэтому используем Query.search или фильтруем вручную
  }

  const response = await databases.listDocuments<CommentWithReplies>(
    DATABASE_ID,
    COLLECTIONS.COMMENTS,
    queries
  )

  // Фильтруем корневые комментарии (у которых parentId пустой или null)
  const rootComments = parentId === null
    ? response.documents.filter(c => !c.parentId || c.parentId === '')
    : response.documents

  // Для каждого комментария получаем ответы
  const commentsWithReplies = await Promise.all(
    rootComments.map(async (comment) => {
      const replies = await getCommentsByPostId(postId, comment.$id, apiKey)
      return {
        ...comment,
        replies,
      }
    })
  )

  return commentsWithReplies
}

/**
 * Создать пост
 */
export async function createPost(
  data: {
    title: string
    content: string
    tags: string[]
    authorId: string
  },
  apiKey: string
): Promise<Post> {
  const databases = getDatabases(apiKey)

  return await databases.createDocument<Post>(
    DATABASE_ID,
    COLLECTIONS.POSTS,
    ID.unique(),
    {
      title: data.title,
      content: data.content,
      tags: data.tags,
      authorId: data.authorId,
    },
    [Permissions.readAny, Permissions.writeUser(data.authorId)]
  )
}

/**
 * Обновить пост
 */
export async function updatePost(
  postId: string,
  data: {
    title?: string
    content?: string
    tags?: string[]
  },
  apiKey: string
): Promise<Post> {
  const databases = getDatabases(apiKey)

  return await databases.updateDocument<Post>(
    DATABASE_ID,
    COLLECTIONS.POSTS,
    postId,
    data
  )
}

/**
 * Удалить пост
 */
export async function deletePost(postId: string, apiKey: string): Promise<void> {
  const databases = getDatabases(apiKey)

  await databases.deleteDocument(
    DATABASE_ID,
    COLLECTIONS.POSTS,
    postId
  )
}

/**
 * Получить все посты для админ-панели
 */
export async function getAllPosts(
  page: number,
  limit: number,
  apiKey: string
): Promise<{ posts: PostWithCounts[]; total: number; totalPages: number }> {
  const databases = getDatabases(apiKey)
  const skip = (page - 1) * limit

  const [postsResponse, totalResponse] = await Promise.all([
    databases.listDocuments<Post>(
      DATABASE_ID,
      COLLECTIONS.POSTS,
      [
        Query.limit(limit),
        Query.offset(skip),
        Query.orderDesc('$createdAt'),
      ]
    ),
    databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.POSTS,
      [Query.limit(1)]
    ),
  ])

  const postsWithCounts = await Promise.all(
    postsResponse.documents.map(async (post) => {
      const [likesCount, commentsCount] = await Promise.all([
        databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.LIKES,
          [Query.equal('postId', post.$id), Query.select(['$id'])]
        ),
        databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.COMMENTS,
          [Query.equal('postId', post.$id), Query.select(['$id'])]
        ),
      ])

      // Получаем автора, если authorId валиден
      let author = { id: '', name: null as string | null, email: 'Unknown' }
      if (post.authorId && /^[a-zA-Z0-9_]+$/.test(post.authorId) && post.authorId.length <= 36) {
        try {
          const authorDoc = await databases.getDocument<User>(
            DATABASE_ID,
            COLLECTIONS.USERS,
            post.authorId
          )
          author = {
            id: authorDoc.$id,
            name: authorDoc.name,
            email: authorDoc.email,
          }
        } catch (error) {
          console.warn('Could not fetch author:', post.authorId, error)
        }
      }

      return {
        ...post,
        author,
        likesCount: likesCount.total,
        commentsCount: commentsCount.total,
      }
    })
  )

  return {
    posts: postsWithCounts,
    total: totalResponse.total,
    totalPages: Math.ceil(totalResponse.total / limit),
  }
}
