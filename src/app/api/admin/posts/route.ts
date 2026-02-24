import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { getAllPosts } from '@/services/posts'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const apiKey = process.env.APPWRITE_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const result = await getAllPosts(page, limit, apiKey)

    // Форматируем ответ с данными авторов
    const postsWithAuthors = await Promise.all(
      result.posts.map(async (post) => {
        return {
          ...post,
          author: {
            id: post.authorId,
            name: post.author.name,
            email: post.author.email,
          },
        }
      })
    )

    return NextResponse.json({
      posts: postsWithAuthors,
      total: result.total,
      page,
      totalPages: result.totalPages,
    })
  } catch (error) {
    console.error('Error fetching posts:', error)
    if ((error as Error).message === 'Unauthorized' || (error as Error).message === 'Forbidden') {
      return NextResponse.json(
        { error: (error as Error).message },
        { status: (error as Error).message === 'Unauthorized' ? 401 : 403 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}
