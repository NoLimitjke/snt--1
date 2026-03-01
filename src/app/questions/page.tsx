'use client'

import type { Metadata } from 'next'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Тип для данных формы
interface QuestionFormData {
  name: string
  email: string
  isPrivate: boolean
  question: string
}

export default function QuestionsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QuestionFormData>({
    defaultValues: {
      isPrivate: true,
    },
  })

  const onSubmit = async (data: QuestionFormData) => {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Ошибка при отправке вопроса')
      }

      toast.success('Вопрос успешно отправлен!', {
        description: 'Ответ будет отправлен на указанный email',
      })

      reset()
    } catch (error) {
      console.error('Error submitting question:', error)
      toast.error('Ошибка при отправке вопроса', {
        description: (error as Error).message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-green-700">Вопросы и обращения</h1>
        <p className="text-muted-foreground">
          Задайте вопрос правлению СНТ №1. Ответ будет отправлен на указанный адрес электронной почты.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Форма отправки вопроса</CardTitle>
          <CardDescription>
            Заполните форму ниже. Обязательные поля отмечены звёздочкой (*)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Имя */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Ваше имя <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Иванов Иван"
                {...register('name', {
                  required: 'Имя обязательно для заполнения',
                  minLength: {
                    value: 2,
                    message: 'Имя должно содержать не менее 2 символов',
                  },
                })}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email для ответа <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="example@mail.ru"
                {...register('email', {
                  required: 'Email обязателен для заполнения',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Некорректный формат email',
                  },
                })}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Тип вопроса */}
            <div className="space-y-3">
              <Label>Тип вопроса <span className="text-red-500">*</span></Label>
              <div className="space-y-2">
                <label className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-green-50 transition-colors">
                  <input
                    type="radio"
                    value="false"
                    {...register('isPrivate', {
                      required: 'Выберите тип вопроса',
                      setValueAs: (value) => value === 'false',
                    })}
                    className="mt-1"
                  />
                  <div className="space-y-1">
                    <span className="font-medium text-sm">Общий вопрос</span>
                    <p className="text-xs text-muted-foreground">
                      Может быть опубликован на сайте после модерации для всеобщего ознакомления
                    </p>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-green-50 transition-colors">
                  <input
                    type="radio"
                    value="true"
                    {...register('isPrivate', {
                      required: 'Выберите тип вопроса',
                      setValueAs: (value) => value === 'true',
                    })}
                    className="mt-1"
                  />
                  <div className="space-y-1">
                    <span className="font-medium text-sm">Личный вопрос</span>
                    <p className="text-xs text-muted-foreground">
                      Ответ будет отправлен только на ваш email, не публикуется на сайте
                    </p>
                  </div>
                </label>
              </div>
              {errors.isPrivate && (
                <p className="text-sm text-red-500">{errors.isPrivate.message}</p>
              )}
            </div>

            {/* Текст вопроса */}
            <div className="space-y-2">
              <Label htmlFor="question">
                Текст вопроса <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="question"
                placeholder="Опишите ваш вопрос подробно..."
                rows={5}
                {...register('question', {
                  required: 'Вопрос обязателен для заполнения',
                  minLength: {
                    value: 10,
                    message: 'Вопрос должен содержать не менее 10 символов',
                  },
                })}
              />
              {errors.question && (
                <p className="text-sm text-red-500">{errors.question.message}</p>
              )}
            </div>

            {/* Кнопка отправки */}
            <Button
              type="submit"
              variant="green"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Отправка...' : 'Отправить вопрос'}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Отправляя форму, вы соглашаетесь с{' '}
              <a href="/privacy" className="text-green-600 hover:underline">
                политикой обработки персональных данных
              </a>
            </p>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong>Сроки ответа:</strong> Вопросы рассматриваются в течение 30 дней
            в соответствии с законодательством РФ.
          </p>
          <p>
            <strong>Личные вопросы:</strong> Не публикуются на сайте, ответ
            отправляется только на указанный email.
          </p>
          <p>
            <strong>Общие вопросы:</strong> Могут быть опубликованы в разделе FAQ
            после модерации для помощи другим членам СНТ.
          </p>
          <p>
            <strong>Срочные вопросы:</strong> По вопросам, требующим немедленного
            решения (аварии, отключения), обращайтесь по телефону диспетчерской службы.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
