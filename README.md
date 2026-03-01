# СНТ №1 - Веб-сайт садового товарищества

Full-stack веб-приложение для садового некоммерческого товарищества, созданное на Next.js 15 с использованием современных технологий.

## 🚀 Технологии

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (Server Actions)
- **База данных**: Appwrite Database
- **Аутентификация**: Appwrite Auth
- **UI компоненты**: shadcn/ui, Radix UI

## 📋 Требования

- Node.js 18.17 или выше
- Аккаунт на [Appwrite](https://appwrite.io)
- npm или yarn

## 🔧 Настройка

### 1. Клонирование и установка зависимостей

```bash
cd snt-website
npm install
```

### 2. Настройка Appwrite

#### 2.1 Создание проекта в Appwrite

1. Зарегистрируйтесь на [cloud.appwrite.io](https://cloud.appwrite.io) (или установите локально)
2. Создайте новый проект с названием `SNT`
3. Скопируйте **Project ID**

#### 2.2 Создание базы данных

1. В проекте перейдите в раздел **Databases**
2. Создайте новую базу данных с ID: `snt_database`
3. Создайте коллекции со следующими настройками:

| Коллекция | ID | Permissions |
|-----------|-----|-------------|
| Users | `users` | Read: Any, Create: Users, Update: Users, Delete: Users |
| Posts | `posts` | Read: Any, Create: Users, Update: Users, Delete: Users |
| Comments | `comments` | Read: Any, Create: Users, Update: Users, Delete: Users |
| Likes | `likes` | Read: Any, Create: Users, Update: Users, Delete: Users |
| Sessions | `sessions` | Read: Any, Create: Users, Update: Users, Delete: Users |
| Questions | `questions` | Read: Any, Create: Users, Update: Users, Delete: Users |

#### 2.3 Атрибуты коллекций

**Users (`users`):**
| Атрибут | Тип | Required | Default |
|---------|-----|----------|---------|
| email | string | Yes | - |
| name | string | No | null |
| image | string | No | null |
| emailVerified | boolean | Yes | false |
| role | string | Yes | USER |
| isBanned | boolean | Yes | false |

**Posts (`posts`):**
| Атрибут | Тип | Required |
|---------|-----|----------|
| title | string | Yes |
| content | string | Yes |
| tags | string array | Yes |
| authorId | string | Yes |

**Comments (`comments`):**
| Атрибут | Тип | Required |
|---------|-----|----------|
| content | string | Yes |
| postId | string | Yes |
| parentId | string | No |
| authorId | string | Yes |

**Sessions (`sessions`):**
| Атрибут | Тип | Required |
|---------|-----|----------|
| userId | string | Yes |
| token | string | Yes |
| expiresAt | datetime | Yes |
| ipAddress | string | No |
| userAgent | string | No |

**Questions (`questions`):**
| Атрибут | Тип | Required |
|---------|-----|----------|
| content | string | Yes |
| authorName | string | Yes |
| authorEmail | string | Yes |
| status | string | Yes |
| answeredAt | datetime | No |

#### 2.4 Создание API ключа

1. Перейдите в **Settings** → **API Keys**
2. Создайте новый ключ с названием `SNT Server`
3. Выберите scope: **All** (или минимум: Database read/write, Users read/write)
4. Скопируйте ключ

### 3. Настройка переменных окружения

Создайте файл `.env.local` в корне проекта:

```env
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_APPWRITE_PROJECT_NAME="SNT"
NEXT_PUBLIC_APPWRITE_ENDPOINT="https://cloud.appwrite.io/v1"

# Appwrite API Key (создайте в консоли Appwrite → API Keys)
APPWRITE_API_KEY="your-api-key"

# Appwrite Database ID
APPWRITE_DATABASE_ID="snt_database"

# Email Configuration (Resend) - опционально
RESEND_API_KEY="re_your_api_key"
EMAIL_FROM="СНТ №1 <onboarding@resend.dev>"
```

### 4. Создание первого администратора

#### Через регистрацию (рекомендуется)

1. Запустите проект: `npm run dev`
2. Перейдите на страницу `/register`
3. Зарегистрируйте пользователя с email администратора
4. В Appwrite Console → Database → `snt_database` → Collection `users` найдите созданного пользователя
5. Измените поле `role` на `ADMIN`

#### Через Appwrite Console

1. Зарегистрируйте пользователя через форму регистрации
2. В Appwrite Console перейдите в базу данных
3. Найдите документ пользователя в коллекции `users`
4. Измените `role: "USER"` на `role: "ADMIN"`

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
├── src/
│   ├── app/
│   │   ├── (auth)/            # Страницы авторизации
│   │   ├── admin/             # Админ-панель
│   │   ├── api/               # API endpoints
│   │   ├── post/[id]/         # Страница поста
│   │   ├── legal/             # Правовая информация
│   │   ├── ustav/             # Устав СНТ
│   │   ├── privacy/           # Политика конфиденциальности
│   │   ├── questions/         # Вопросы и обращения
│   │   ├── faq/               # Часто задаваемые вопросы
│   │   └── page.tsx           # Главная страница
│   ├── components/
│   │   ├── ui/                # shadcn/ui компоненты
│   │   ├── Header.tsx         # Шапка сайта
│   │   ├── Footer.tsx         # Подвал сайта
│   │   ├── CommentTree.tsx    # Древовидные комментарии
│   │   └── CommentForm.tsx    # Форма комментария
│   ├── lib/
│   │   ├── appwrite.ts        # Appwrite клиент конфигурация
│   │   ├── auth-helpers.ts    # Вспомогательные функции аутентификации
│   │   └── utils.ts           # Утилиты
│   ├── services/
│   │   ├── users.ts           # CRUD пользователей
│   │   ├── posts.ts           # CRUD постов
│   │   ├── comments.ts        # CRUD комментариев
│   │   └── questions.ts       # CRUD вопросов
│   └── types/
│       └── index.ts           # TypeScript типы
├── public/                    # Статические файлы
└── .env.local                 # Переменные окружения
```

## 🔐 Роли пользователей

- **GUEST** - Только чтение постов
- **USER** - Чтение, комментарии, лайки, создание вопросов
- **ADMIN** - Полный доступ, управление пользователями, постами и вопросами

## 📝 Функционал

### Главная страница
- Список постов с пагинацией (10 постов/страница)
- Фильтры по тегам: ВАЖНОЕ, СОВЕЩАНИЕ, МЕРОПРИЯТИЯ, ВСЕ
- Поиск по заголовкам и содержанию

### Страница поста
- Просмотр полного контента (Markdown)
- Система лайков
- Древовидные комментарии с ответами
- Форма добавления комментария

### Админ-панель
- **Dashboard** - Статистика и быстрые действия
- **Пользователи** - Управление ролями, бан/разбан, удаление
- **Посты** - CRUD операции с постами
- **Вопросы** - Просмотр и обработка обращений пользователей

### Информационные страницы
- **Правовая информация** - Официальные документы СНТ
- **Устав СНТ** - Устав товарищества
- **Политика конфиденциальности** - Обработка персональных данных
- **Вопросы и обращения** - Форма обратной связи
- **FAQ** - Часто задаваемые вопросы

## 🌐 Деплой на Vercel

### 1. Подготовка

1. Создайте репозиторий на GitHub
2. Запушьте проект

### 2. Настройка Vercel

1. Импортируйте проект в [Vercel](https://vercel.com)
2. Добавьте переменные окружения:
   - `NEXT_PUBLIC_APPWRITE_PROJECT_ID` - ID проекта Appwrite
   - `NEXT_PUBLIC_APPWRITE_ENDPOINT` - Endpoint Appwrite
   - `APPWRITE_API_KEY` - API ключ Appwrite
   - `APPWRITE_DATABASE_ID` - ID базы данных

### 3. Настройка Appwrite для продакшена

1. В консоли Appwrite добавьте домен Vercel в **Allowed Origins**
2. Убедитесь, что все коллекции имеют правильные permissions

## 🎨 Цветовая схема

- Основной фон: `#f0fdf4` (светло-зелёный)
- Акцентный зеленый: `#22c55e`
- Темно-зеленый: `#16a34a`
- Текст: `#1e293b`

## 📦 API Endpoints

### Публичные
- `GET /api/posts` - Список постов
- `GET /api/posts/[id]` - Конкретный пост
- `GET /api/questions` - Список вопросов

### Требуют авторизации
- `POST /api/posts/[id]/like` - Лайк поста
- `POST /api/comments` - Создание комментария
- `POST /api/comments/[id]/like` - Лайк комментария
- `GET /api/auth/get-session` - Получение текущей сессии
- `POST /api/auth/sign-out` - Выход из системы

### Требуют ADMIN
- `GET/POST /api/admin/posts` - Список/создание постов
- `PUT/DELETE /api/admin/posts/[id]` - Редактирование/удаление поста
- `GET/POST /api/admin/users` - Управление пользователями
- `PUT/DELETE /api/admin/users/[id]` - Изменение пользователя

## 🔧 Команды

```bash
# Режим разработки
npm run dev

# Продакшен сборка
npm run build
npm run start

# Линтинг кода
npm run lint

# Проверка типов TypeScript
npx tsc --noEmit
```

## ⚠️ Известные ограничения

- **Ошибка 401 при получении сессии:** Убедитесь, что коллекция `sessions` имеет правильные permissions (Read: Any или Read: Users)
- **Не создаётся сессия:** Проверьте, что API ключ имеет доступ ко всем коллекциям
- **Ошибки при миграции:** Appwrite не требует миграций - все коллекции создаются вручную через консоль

## 🔒 Безопасность

- Все пароли хешируются через Appwrite Auth
- Сессии хранятся в базе данных с сроком действия 7 дней
- API endpoints защищены проверкой ролей
- Cookie устанавливаются с флагами httpOnly и secure

## 📝 Лицензия

© 2026 СНТ №1. Все права защищены.

## 🤝 Поддержка

По вопросам обращайтесь к администрации СНТ №1.

## 📞 Контакты

- **Адрес:** [указать адрес]
- **Телефон:** [указать телефон]
- **Email:** [указать email]
