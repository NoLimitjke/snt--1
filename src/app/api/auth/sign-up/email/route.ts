import { NextRequest, NextResponse } from 'next/server'
import { Client, Account, Databases, ID } from 'node-appwrite'
import { DATABASE_ID, COLLECTIONS, getServerClient } from '@/lib/appwrite'
import { createSession } from '@/lib/auth-helpers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = body

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

    // Проверяем, существует ли уже пользователь с таким email
    const existingUsers = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.USERS,
      []
    )

    const existingUser = existingUsers.documents.find(
      (doc: any) => doc.email === email
    )

    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 400 }
      )
    }

    // Создаем аккаунт в Appwrite Authentication
    const authAccount = await account.create(
      ID.unique(),
      email,
      password,
      name || undefined
    )

    // Создаем запись пользователя в базе данных
    const user = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.USERS,
      authAccount.$id,
      {
        email,
        name: name || null,
        image: null,
        emailVerified: false,
        role: 'USER',
        isBanned: false,
      }
    )

    return NextResponse.json({
      id: user.$id,
      email: user.email,
      name: user.name,
    })
  } catch (error: any) {
    console.error('Registration error:', error)

    if (error.code === 409) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Ошибка при регистрации' },
      { status: 500 }
    )
  }
}
