import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { updateUser, deleteUser } from '@/services/users'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()

    const { id } = await params
    const body = await request.json()
    const { role, isBanned } = body

    const apiKey = process.env.APPWRITE_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const updatedUser = await updateUser(
      id,
      {
        ...(role && { role }),
        ...(typeof isBanned === 'boolean' && { isBanned }),
      },
      apiKey
    )

    return NextResponse.json({
      id: updatedUser.$id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      isBanned: updatedUser.isBanned,
      createdAt: updatedUser.$createdAt,
    })
  } catch (error) {
    console.error('Error updating user:', error)
    if ((error as Error).message === 'Unauthorized' || (error as Error).message === 'Forbidden') {
      return NextResponse.json(
        { error: (error as Error).message },
        { status: (error as Error).message === 'Unauthorized' ? 401 : 403 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()

    const { id } = await params

    const apiKey = process.env.APPWRITE_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    await deleteUser(id, apiKey)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    if ((error as Error).message === 'Unauthorized' || (error as Error).message === 'Forbidden') {
      return NextResponse.json(
        { error: (error as Error).message },
        { status: (error as Error).message === 'Unauthorized' ? 401 : 403 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
