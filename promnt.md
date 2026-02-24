Переделай мой Next.js проект под Appwrite вместо текущей БД (Prisma/PostgreSQL).

Текущие env переменные Appwrite (НЕ МЕНЯЙ их):

text
NEXT_PUBLIC_APPWRITE_PROJECT_ID="699789ab002d46b8172f"
NEXT_PUBLIC_APPWRITE_PROJECT_NAME="SNT" 
NEXT_PUBLIC_APPWRITE_ENDPOINT="https://fra.cloud.appwrite.io/v1"
Что нужно сделать:

Замени все Prisma/PostgreSQL вызовы на Appwrite SDK

Установи: npm i node-appwrite и @appwrite.io/client (если browser)

Создай Appwrite сервис (lib/appwrite.js или services/appwrite.js)

Appwrite сервис должен включать:

js
import { Client, Account, Databases, ID } from 'node-appwrite';

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

export const databases = new Databases(client);
Перепиши все модели/схемы под Appwrite Collections:

Создай коллекции для каждой сущности (User, Post, etc.)

Attributes: string, integer, datetime, boolean, relationship

Permissions: read("any"), write("users")

Переделай все CRUD операции:

text
✅ prisma.user.findMany() → databases.listDocuments()
✅ prisma.user.create() → databases.createDocument() 
✅ prisma.user.findUnique() → databases.getDocument()
✅ prisma.user.update() → databases.updateDocument()
✅ prisma.user.delete() → databases.deleteDocument()
Обнови все API роуты (/api/...):

Используй Appwrite server SDK (node-appwrite)

Добавь проверку авторизации через account.get()

Frontend изменения:

Создай useAppwrite хук или context

Реактивность через SWR или React Query + Appwrite realtime

Структура файлов:

text
lib/
  appwrite.js          # Appwrite client config
services/
  users.js            # user CRUD
  posts.js            # post CRUD  
hooks/
  useAppwrite.js      # custom hooks
Сохрани:

Все существующие компоненты UI

Tailwind стили

Логику бизнес-логики

Только замени data layer

Верни полный рабочий код со всеми изменениями, готовый к деплою.