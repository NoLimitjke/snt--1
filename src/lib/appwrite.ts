import { Client, Account, Databases, ID, Permission, Role } from 'node-appwrite'

// Инициализация клиента Appwrite
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)

// Серверный клиент с ключом API (для API роутов)
export function getServerClient(apiKey: string) {
  const serverClient = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(apiKey)

  return serverClient
}

export const databases = new Databases(client)
export const account = new Account(client)

// ID коллекций Appwrite (нужно создать в консоли Appwrite)
export const COLLECTIONS = {
  USERS: 'users',
  POSTS: 'posts',
  COMMENTS: 'comments',
  LIKES: 'likes',
  SESSIONS: 'sessions',
  QUESTIONS: 'questions',
} as const

// ID базы данных (нужно создать в консоли Appwrite)
export const DATABASE_ID = 'snt_database'

// Экспорт ID для использования в сервисах
export { ID }

// Permissions helpers
export const Permissions = {
  // Читать могут все
  readAny: Permission.read(Role.any()),
  // Писать могут только авторизованные пользователи
  writeUsers: Permission.write(Role.users()),
  // Писать может только конкретный пользователь
  writeUser: (userId: string) => Permission.write(Role.user(userId)),
  // Читать может только конкретный пользователь
  readUser: (userId: string) => Permission.read(Role.user(userId)),
  // Права для сессий - читать/писать может только владелец сессии
  readSession: (userId: string) => Permission.read(Role.user(userId)),
  writeSession: (userId: string) => Permission.write(Role.user(userId)),
}
