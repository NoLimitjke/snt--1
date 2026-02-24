import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-helpers'
import { createComment } from '@/services/comments'
import { getUserByEmail } from '@/services/users'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { content, postId, parentId } = body

    if (!content || !postId) {
      return NextResponse.json(
        { error: 'Content and postId are required' },
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

    const user = await getUserByEmail(session.user.email, apiKey)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const comment = await createComment(
      {
        content,
        postId,
        authorId: user.$id,
        parentId: parentId || null,
      },
      apiKey
    )

    // Формируем ответ с данными автора
    const commentWithAuthor = {
      ...comment,
      author: {
        id: user.$id,
        name: user.name,
        email: user.email,
      },
      replies: [],
    }

    return NextResponse.json(commentWithAuthor, { status: 201 })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}
