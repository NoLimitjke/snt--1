# СНТ №1 - Веб-сайт садового товарищества

Full-stack веб-приложение для садового некоммерческого товарищества, созданное на Next.js 15 с использованием современных технологий.

## 🚀 Технологии

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, better-auth
- **База данных**: PostgreSQL (NeonDB)
- **ORM**: Prisma
- **UI компоненты**: shadcn/ui, Radix UI

## 📋 Требования

- Node.js 18.17 или выше
- Аккаунт на [Neon](https://neon.tech) для базы данных
- npm или yarn

## 🔧 Настройка

### 1. Клонирование и установка зависимостей

```bash
cd snt-website
npm install
```

### 2. Настройка базы данных NeonDB

1. Зарегистрируйтесь на [neon.tech](https://neon.tech)
2. Создайте новый проект
3. Скопируйте строку подключения (Connection String)

**⚠️ Важно:** Для миграций Prisma используйте **прямое подключение** (без `-pooler` в URL):

```env
# Для миграций (прямое подключение)
DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"

# Для приложения (пулер - лучше производительность)
DATABASE_URL="postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require"
```

4. Создайте файл `.env` в корне проекта:

```env
DATABASE_URL="postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require"
NEXTAUTH_SECRET="your-secret-key-here"
```

Для генерации секрета выполните:
```bash
openssl rand -base64 32
```

### 3. Инициализация базы данных

**Вариант A: Автоматическая миграция**

```bash
# Временно замените DATABASE_URL на прямое подключение (без -pooler)
# Затем выполните:
npx prisma migrate dev --name init

# Верните пулер в DATABASE_URL
```

**Вариант B: Ручная миграция (если Prisma не подключается)**

```bash
# Применить миграцию через скрипт
npx tsx scripts/apply-migration.ts

# Создать администратора
npx tsx scripts/create-admin.ts
```

### 4. Создание первого администратора

После подключения к базе данных создайте первого пользователя с ролью ADMIN.

#### Через скрипт (рекомендуется)

```bash
npx tsx scripts/create-admin.ts
```

Это создаст пользователя:
- **Email:** admin@snt.ru
- **Пароль:** admin123

#### Через Prisma Studio

```bash
npx prisma studio
```

Создайте пользователя вручную:
- email: `admin@snt.ru`
- password: (хешированный пароль)
- role: `ADMIN`

### 5. Запуск проекта

```bash
# Режим разработки
npm run dev

# Продакшен сборка
npm run build
npm run start
```

Приложение будет доступно по адресу [http://localhost:3000](http://localhost:3000)

## 📁 Структура проекта

```
snt-website/
├── prisma/
│   └── schema.prisma          # Схема базы данных
├── src/
│   ├── app/
│   │   ├── (auth)/            # Страницы авторизации
│   │   ├── admin/             # Админ-панель
│   │   ├── api/               # API endpoints
│   │   ├── post/[id]/         # Страница поста
│   │   └── page.tsx           # Главная страница
│   ├── components/
│   │   ├── ui/                # shadcn/ui компоненты
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── PostCard.tsx
│   │   ├── CommentTree.tsx
│   │   └── CommentForm.tsx
│   └── lib/
│       ├── auth.ts            # Конфигурация better-auth
│       ├── prisma.ts          # Prisma клиент
│       └── utils.ts           # Утилиты
└── .env                       # Переменные окружения
```

## 🔐 Роли пользователей

- **GUEST** - Только чтение постов
- **USER** - Чтение, комментарии, лайки
- **ADMIN** - Полный доступ, управление пользователями и постами

## 📝 Функционал

### Главная страница
- Список постов с пагинацией (10 постов/страница)
- Фильтры по тегам: ВАЖНОЕ, СОВЕЩАНИЕ, МЕРОПРИЯТИЯ
- Поиск по заголовкам

### Страница поста
- Просмотр полного контента (Markdown)
- Система лайков
- Древовидные комментарии с ответами

### Админ-панель
- **Dashboard** - Статистика и быстрые действия
- **Пользователи** - Управление ролями, бан/разбан
- **Посты** - CRUD операции с постами

## 🌐 Деплой на Vercel

### 1. Подготовка

1. Создайте репозиторий на GitHub
2. Запушьте проект

### 2. Настройка Vercel

1. Импортируйте проект в [Vercel](https://vercel.com)
2. Добавьте переменные окружения:
   - `DATABASE_URL` - строка подключения к NeonDB
   - `NEXTAUTH_SECRET` - секретный ключ

### 3. Миграция базы данных

После первого деплоя выполните миграцию:

```bash
vercel env pull
npx prisma migrate deploy
```

Или добавьте в `package.json`:

```json
{
  "scripts": {
    "postinstall": "prisma generate && prisma migrate deploy"
  }
}
```

## 🎨 Цветовая схема

- Основной фон: `#f0fdf4`
- Акцентный зеленый: `#22c55e`
- Темно-зеленый: `#16a34a`
- Текст: `#1e293b`

## 📦 API Endpoints

### Публичные
- `GET /api/posts` - Список постов
- `GET /api/posts/[id]` - Конкретный пост

### Требуют авторизации
- `POST /api/posts/[id]/like` - Лайк поста
- `POST /api/comments` - Создание комментария
- `POST /api/comments/[id]/like` - Лайк комментария

### Требуют ADMIN
- `GET/POST /api/posts` - Список/создание постов
- `PUT/DELETE /api/posts/[id]` - Редактирование/удаление поста
- `GET/POST /api/admin/users` - Управление пользователями
- `PUT/DELETE /api/admin/users/[id]` - Изменение пользователя

## 🔧 Дополнительные команды

```bash
# Форматирование кода
npm run lint

# Проверка типов
npx tsc --noEmit

# Prisma Studio (GUI для БД)
npx prisma studio

# Сброс базы данных
npx prisma migrate reset

# Создание администратора
npx tsx scripts/create-admin.ts
```

## ⚠️ Известные ограничения

- **Ошибка P1017 при миграции:** Если вы получаете ошибку `P1017: Server has closed the connection` при выполнении `npx prisma migrate dev`, используйте ручную миграцию через скрипты:
  ```bash
  npx tsx scripts/apply-migration.ts
  npx tsx scripts/create-admin.ts
  ```

- **BetterAuthError во время сборки:** Ошибки `BetterAuthError: Failed to initialize database adapter` во время `npm run build` являются нормальными и возникают из-за того, что Next.js пытается собрать все API routes во время компиляции. При запуске приложения с правильным `DATABASE_URL` всё будет работать.

- **Пулер подключений NeonDB:** Для миграций используйте прямое подключение (без `-pooler` в URL), для приложения — пулер (с `-pooler`) для лучшей производительности.

## 📝 Лицензия

© 2026 СНТ №1. Все права защищены.

## 🤝 Поддержка

По вопросам обращайтесь к администрации СНТ №1.
