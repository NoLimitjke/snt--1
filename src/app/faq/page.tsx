'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronDown, ChevronUp, MessageSquare } from 'lucide-react'

interface Question {
  $id: string
  name: string
  email: string
  question: string
  isPrivate: boolean
  isPublished: boolean
  adminAnswer: string | null
  $createdAt: string
  $updatedAt: string
}

export default function FAQPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/questions?publicOnly=true&page=1&limit=50')
      if (!response.ok) {
        throw new Error('Failed to fetch questions')
      }
      const data = await response.json()
      setQuestions(data.questions || [])
    } catch (error) {
      console.error('Error fetching questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-green-700">Частые вопросы (FAQ)</h1>
        <p className="text-muted-foreground">
          Ответы на часто задаваемые вопросы членов СНТ №1
        </p>
      </div>

      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <MessageSquare className="h-6 w-6 text-green-600 mt-1" />
            <div className="space-y-2">
              <p className="text-sm text-green-800">
                Здесь публикуются общие вопросы и ответы администрации СНТ.
              </p>
              <p className="text-sm text-green-700">
                Для личного вопроса используйте{' '}
                <Link href="/questions" className="text-green-600 font-medium hover:underline">
                  форму отправки вопросов
                </Link>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-muted mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : questions.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-muted-foreground">
              Пока нет опубликованных вопросов. Будьте первыми — задайте свой вопрос!
            </p>
            <Button asChild variant="green" className="mt-4">
              <Link href="/questions">Задать вопрос</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <Card key={q.$id} className="overflow-hidden">
              <button
                onClick={() => toggleExpanded(q.$id)}
                className="w-full text-left"
              >
                <CardHeader className="bg-gradient-to-r from-green-50 to-transparent">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <CardTitle className="text-lg font-semibold">
                        {q.question.length > 100
                          ? q.question.substring(0, 100) + '...'
                          : q.question}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <span>{q.name}</span>
                        <span>•</span>
                        <span>{formatDate(q.$createdAt)}</span>
                      </CardDescription>
                    </div>
                    <div className="flex-shrink-0">
                      {expandedId === q.$id ? (
                        <ChevronUp className="h-5 w-5 text-green-600" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                  </div>
                </CardHeader>
              </button>

              {expandedId === q.$id && (
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-green-700">Вопрос:</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {q.question}
                    </p>
                  </div>

                  {q.adminAnswer && (
                    <div className="space-y-2 p-4 rounded-lg bg-green-50 border border-green-200">
                      <h4 className="font-semibold text-green-700">Ответ администрации:</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {q.adminAnswer}
                      </p>
                    </div>
                  )}

                  {!q.adminAnswer && (
                    <p className="text-sm text-amber-600 italic">
                      Ответ на вопрос готовится и будет опубликован в ближайшее время.
                    </p>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-center pt-8">
        <Button asChild variant="green" size="lg">
          <Link href="/questions">Задать свой вопрос</Link>
        </Button>
      </div>
    </div>
  )
}
