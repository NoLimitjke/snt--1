// Типы для аутентификации Appwrite

export interface Session {
  user: {
    id: string
    email: string
    name: string | null
    role: 'ADMIN' | 'USER'
    isBanned: boolean
  }
  expiresAt: string
}

export type { User } from '@/services/users'
