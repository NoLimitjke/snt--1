import { NextRequest, NextResponse } from 'next/server'
import { Client, Account, Databases, Query } from 'node-appwrite'
import { DATABASE_ID, COLLECTIONS, getServerClient } from '@/lib/appwrite'
import { createSession } from '@/lib/auth-helpers'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email и пароль обязательны' },
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

    const client = getServerClient(apiKey)
    const account = new Account(client)
    const databases = new Databases(client)

    // Находим пользователя по email
    const users = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.USERS,
      [Query.equal('email', email), Query.limit(1)]
    )

    if (users.documents.length === 0) {
      return NextResponse.json(
        { error: 'Неверный email или пароль' },
        { status: 401 }
      )
    }

    const user = users.documents[0]

    // Проверяем, забанен ли пользователь
    if (user.isBanned) {
      return NextResponse.json(
        { error: 'Аккаунт заблокирован' },
        { status: 403 }
      )
    }

    // Создаем сессию в Appwrite Authentication
    const session = await account.createEmailPasswordSession(email, password)

    // Создаем запись сессии в нашей базе данных
    const sessionToken = await createSession(user.$id)

    // Устанавливаем cookie
    const cookieStore = await cookies()
    cookieStore.set('appwrite-session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 дней
      path: '/',
    })

    return NextResponse.json({
      id: user.$id,
      email: user.email,
      name: user.name,
      role: user.role,
    })
  } catch (error: any) {
    console.error('Login error:', error)

    if (error.code === 401) {
      return NextResponse.json(
        { error: 'Неверный email или пароль' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Ошибка при входе' },
      { status: 500 }
    )
  }
}
