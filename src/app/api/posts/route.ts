import { NextRequest, NextResponse } from 'next/server'
import { getSession, requireAdmin } from '@/lib/auth-helpers'
import { getPosts, createPost, getPostById } from '@/services/posts'
import { getUserByEmail } from '@/services/users'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const tag = searchParams.get('tag')
    const search = searchParams.get('search')

    const apiKey = process.env.APPWRITE_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const result = await getPosts(
      page,
      limit,
      { tag: tag || undefined, search: search || undefined },
      apiKey
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { title, content, tags } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.APPWRITE_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const session = await getSession()
    const user = await getUserByEmail(session!.user.email, apiKey)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const post = await createPost(
      {
        title,
        content,
        tags: tags || [],
        authorId: user.$id,
      },
      apiKey
    )

    // Получаем данные автора для ответа
    const postWithAuthor = {
      ...post,
      author: {
        id: user.$id,
        name: user.name,
        email: user.email,
      },
      likesCount: 0,
      commentsCount: 0,
    }

    return NextResponse.json(postWithAuthor, { status: 201 })
  } catch (error) {
    console.error('Error creating post:', error)
    if ((error as Error).message === 'Unauthorized' || (error as Error).message === 'Forbidden') {
      return NextResponse.json(
        { error: (error as Error).message },
        { status: (error as Error).message === 'Unauthorized' ? 401 : 403 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}
