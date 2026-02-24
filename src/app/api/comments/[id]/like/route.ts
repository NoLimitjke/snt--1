import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-helpers'
import { toggleLike } from '@/services/likes'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const apiKey = process.env.APPWRITE_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const result = await toggleLike(
      {
        userId: session.user.id,
        postId: null,
        commentId: id,
      },
      apiKey
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error toggling comment like:', error)
    return NextResponse.json(
      { error: 'Failed to toggle comment like' },
      { status: 500 }
    )
  }
}
