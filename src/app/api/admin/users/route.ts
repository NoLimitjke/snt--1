import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { getUsers, updateUser, deleteUser, getUserStats } from '@/services/users'

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

    const result = await getUsers(page, limit, apiKey)

    // Добавляем статистику по пользователям
    const usersWithStats = await Promise.all(
      result.users.map(async (user) => {
        const stats = await getUserStats(user.$id, apiKey)
        return {
          ...user,
          _count: {
            posts: stats.posts,
            comments: stats.comments,
          },
        }
      })
    )

    return NextResponse.json({
      users: usersWithStats,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    if ((error as Error).message === 'Unauthorized' || (error as Error).message === 'Forbidden') {
      return NextResponse.json(
        { error: (error as Error).message },
        { status: (error as Error).message === 'Unauthorized' ? 401 : 403 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
