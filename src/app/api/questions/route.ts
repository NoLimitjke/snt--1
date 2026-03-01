import { NextRequest, NextResponse } from 'next/server'
import { getSession, requireAdmin } from '@/lib/auth-helpers'
import { 
  getQuestions, 
  getPublishedQuestions, 
  createQuestion, 
  updateQuestion, 
  deleteQuestion,
  sendQuestionAnswer 
} from '@/services/questions'
import { getUserByEmail } from '@/services/users'

/**
 * GET /api/questions
 * Получить вопросы (для админ-панели или публичные)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const isPrivate = searchParams.get('isPrivate')
    const isPublished = searchParams.get('isPublished')
    const publicOnly = searchParams.get('publicOnly') === 'true'

    const apiKey = process.env.APPWRITE_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Публичные вопросы для FAQ
    if (publicOnly) {
      const result = await getPublishedQuestions(page, limit, apiKey)
      return NextResponse.json(result)
    }

    // Админ-панель - требуется авторизация админа
    await requireAdmin()

    const filters: {
      isPrivate?: boolean
      isPublished?: boolean
    } = {}

    if (isPrivate !== null && isPrivate !== undefined) {
      filters.isPrivate = isPrivate === 'true'
    }

    if (isPublished !== null && isPublished !== undefined) {
      filters.isPublished = isPublished === 'true'
    }

    const result = await getQuestions(page, limit, filters, apiKey)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching questions:', error)
    if ((error as Error).message === 'Unauthorized' || (error as Error).message === 'Forbidden') {
      return NextResponse.json(
        { error: (error as Error).message },
        { status: (error as Error).message === 'Unauthorized' ? 401 : 403 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/questions
 * Создать новый вопрос
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, question, isPrivate } = body

    if (!name || !email || !question) {
      return NextResponse.json(
        { error: 'Name, email, and question are required' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    if (question.length < 10) {
      return NextResponse.json(
        { error: 'Question must be at least 10 characters long' },
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

    // Пытаемся получить сессию пользователя
    let userId: string | null = null
    try {
      const session = await getSession()
      if (session) {
        userId = session.user.id
      }
    } catch (e) {
      // Нет сессии - это нормально для анонимных пользователей
    }

    const createdQuestion = await createQuestion(
      {
        userId,
        name,
        email,
        question,
        isPrivate: Boolean(isPrivate),
      },
      apiKey
    )

    return NextResponse.json(createdQuestion, { status: 201 })
  } catch (error) {
    console.error('Error creating question:', error)
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/questions
 * Обновить вопрос (админ-панель)
 */
export async function PUT(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { questionId, isPublished, adminAnswer } = body

    if (!questionId) {
      return NextResponse.json(
        { error: 'Question ID is required' },
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

    // Получаем вопрос для отправки email
    const questionData = await updateQuestion(
      questionId,
      {
        isPublished: isPublished !== undefined ? isPublished : undefined,
        adminAnswer: adminAnswer !== undefined ? adminAnswer : undefined,
      },
      apiKey
    )

    // Если есть ответ админа, отправляем email
    if (adminAnswer !== undefined && questionData.email) {
      await sendQuestionAnswer(questionData.email, questionData.question, adminAnswer)
    }

    return NextResponse.json(questionData)
  } catch (error) {
    console.error('Error updating question:', error)
    if ((error as Error).message === 'Unauthorized' || (error as Error).message === 'Forbidden') {
      return NextResponse.json(
        { error: (error as Error).message },
        { status: (error as Error).message === 'Unauthorized' ? 401 : 403 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update question' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/questions
 * Удалить вопрос (админ-панель)
 */
export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin()

    const searchParams = request.nextUrl.searchParams
    const questionId = searchParams.get('id')

    if (!questionId) {
      return NextResponse.json(
        { error: 'Question ID is required' },
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

    await deleteQuestion(questionId, apiKey)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting question:', error)
    if ((error as Error).message === 'Unauthorized' || (error as Error).message === 'Forbidden') {
      return NextResponse.json(
        { error: (error as Error).message },
        { status: (error as Error).message === 'Unauthorized' ? 401 : 403 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to delete question' },
      { status: 500 }
    )
  }
}
