import { NextRequest, NextResponse } from 'next/server'
import { Client, Account } from 'node-appwrite'
import { getServerClient } from '@/lib/appwrite'
import { deleteSession, getSession } from '@/lib/auth-helpers'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('appwrite-session')?.value

    if (sessionToken) {
      // Удаляем сессию из базы данных
      await deleteSession(sessionToken)

      // Также удаляем сессию в Appwrite Authentication (если возможно)
      try {
        const apiKey = process.env.APPWRITE_API_KEY
        if (apiKey) {
          const client = getServerClient(apiKey)
          const account = new Account(client)
          // Пытаемся удалить текущую сессию
          await account.deleteSession('current')
        }
      } catch (error) {
        // Игнорируем ошибки, если сессия уже неактивна
      }

      // Удаляем cookie
      cookieStore.set('appwrite-session', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Ошибка при выходе' },
      { status: 500 }
    )
  }
}
