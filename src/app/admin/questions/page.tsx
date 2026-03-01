'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Eye, EyeOff, Pencil, Trash2, Filter, Check, X } from 'lucide-react'

interface Question {
  $id: string
  userId: string | null
  name: string
  email: string
  question: string
  isPrivate: boolean
  isPublished: boolean
  adminAnswer: string | null
  $createdAt: string
  $updatedAt: string
}

type FilterType = 'all' | 'private' | 'public' | 'published' | 'unpublished'

export default function QuestionsPage() {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [adminAnswer, setAdminAnswer] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchQuestions()
  }, [filter])

  const fetchQuestions = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', '1')
      params.set('limit', '100')

      if (filter === 'private') {
        params.set('isPrivate', 'true')
      } else if (filter === 'public') {
        params.set('isPrivate', 'false')
      } else if (filter === 'published') {
        params.set('isPublished', 'true')
      } else if (filter === 'unpublished') {
        params.set('isPublished', 'false')
      }

      const response = await fetch(`/api/questions?${params.toString()}`)
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          router.push('/login')
          return
        }
        throw new Error('Failed to fetch questions')
      }
      const data = await response.json()
      setQuestions(data.questions || [])
    } catch (error) {
      console.error('Error fetching questions:', error)
      toast.error('Ошибка при загрузке вопросов')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (question: Question) => {
    setSelectedQuestion(question)
    setAdminAnswer(question.adminAnswer || '')
    setIsPublished(question.isPublished)
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!selectedQuestion) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/questions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: selectedQuestion.$id,
          adminAnswer,
          isPublished: selectedQuestion.isPrivate ? false : isPublished,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update question')
      }

      toast.success('Вопрос обновлён', {
        description: 'Ответ отправлен на email заявителя',
      })

      setIsDialogOpen(false)
      fetchQuestions()
    } catch (error) {
      console.error('Error updating question:', error)
      toast.error('Ошибка при обновлении вопроса')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (questionId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот вопрос?')) return

    try {
      const response = await fetch(`/api/questions?id=${questionId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete question')
      }

      toast.success('Вопрос удалён')
      fetchQuestions()
    } catch (error) {
      console.error('Error deleting question:', error)
      toast.error('Ошибка при удалении вопроса')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-green-700">Вопросы/обращения</h1>
          <p className="text-muted-foreground mt-1">
            Управление вопросами и обращениями граждан
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Фильтр:</span>
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          Все
        </Button>
        <Button
          variant={filter === 'private' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('private')}
        >
          <EyeOff className="h-3 w-3 mr-1" />
          Личные
        </Button>
        <Button
          variant={filter === 'public' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('public')}
        >
          <Eye className="h-3 w-3 mr-1" />
          Общие
        </Button>
        <Button
          variant={filter === 'published' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('published')}
        >
          <Check className="h-3 w-3 mr-1" />
          Опубликованные
        </Button>
        <Button
          variant={filter === 'unpublished' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('unpublished')}
        >
          <X className="h-3 w-3 mr-1" />
          Неопубликованные
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="rounded-md border">
          <div className="p-4 text-center text-muted-foreground">
            Загрузка...
          </div>
        </div>
      ) : questions.length === 0 ? (
        <div className="rounded-md border">
          <div className="p-4 text-center text-muted-foreground">
            Вопросы не найдены
          </div>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Дата</TableHead>
                <TableHead>Автор</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="max-w-[300px]">Вопрос</TableHead>
                <TableHead>Ответ</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.map((q) => (
                <TableRow key={q.$id}>
                  <TableCell className="text-sm">
                    {formatDate(q.$createdAt)}
                  </TableCell>
                  <TableCell className="font-medium">{q.name}</TableCell>
                  <TableCell className="text-sm">{q.email}</TableCell>
                  <TableCell>
                    {q.isPrivate ? (
                      <Badge variant="secondary" className="gap-1">
                        <EyeOff className="h-3 w-3" />
                        Личный
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <Eye className="h-3 w-3" />
                        Общий
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {q.isPublished ? (
                      <Badge className="gap-1 bg-green-600">
                        <Check className="h-3 w-3" />
                        Опубликован
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <X className="h-3 w-3" />
                        Не опубликован
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[300px]">
                    <p className="text-sm truncate" title={q.question}>
                      {q.question.length > 50
                        ? q.question.substring(0, 50) + '...'
                        : q.question}
                    </p>
                  </TableCell>
                  <TableCell>
                    {q.adminAnswer ? (
                      <Badge variant="outline" className="gap-1">
                        <Check className="h-3 w-3" />
                        Есть ответ
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">Нет</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(q)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(q.$id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Редактирование вопроса</DialogTitle>
            <DialogDescription>
              Ответ будет отправлен на email заявителя
            </DialogDescription>
          </DialogHeader>

          {selectedQuestion && (
            <div className="space-y-4">
              {/* Question info */}
              <div className="space-y-2 p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Автор:</span>
                  <span className="text-sm">{selectedQuestion.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Email:</span>
                  <span className="text-sm">{selectedQuestion.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Дата:</span>
                  <span className="text-sm">
                    {formatDate(selectedQuestion.$createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Тип:</span>
                  {selectedQuestion.isPrivate ? (
                    <Badge variant="secondary">Личный</Badge>
                  ) : (
                    <Badge variant="outline">Общий</Badge>
                  )}
                </div>
              </div>

              {/* Question text */}
              <div className="space-y-2">
                <Label>Текст вопроса</Label>
                <div className="p-4 rounded-lg border bg-white">
                  <p className="text-sm whitespace-pre-wrap">
                    {selectedQuestion.question}
                  </p>
                </div>
              </div>

              {/* Admin answer */}
              <div className="space-y-2">
                <Label htmlFor="adminAnswer">Ответ администрации</Label>
                <Textarea
                  id="adminAnswer"
                  placeholder="Введите ваш ответ..."
                  rows={5}
                  value={adminAnswer}
                  onChange={(e) => setAdminAnswer(e.target.value)}
                />
              </div>

              {/* Publish checkbox (only for non-private questions) */}
              {!selectedQuestion.isPrivate && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="isPublished">
                    Опубликовать на сайте (в разделе FAQ)
                  </Label>
                </div>
              )}

              {selectedQuestion.isPrivate && (
                <p className="text-sm text-amber-600">
                  Личные вопросы не публикуются на сайте. Ответ будет отправлен
                  только на email заявителя.
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            <Button variant="green" onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
