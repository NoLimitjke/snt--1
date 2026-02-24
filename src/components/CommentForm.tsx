'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'

interface CommentFormProps {
  postId: string
  session: any
}

export function CommentForm({ postId, session }: CommentFormProps) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) return
    if (!session) {
      router.push('/login')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          postId,
        }),
      })

      if (res.ok) {
        setContent('')
        router.refresh()
      }
    } catch (error) {
      console.error('Error creating comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!session) {
    return (
      <div className="rounded-lg border bg-muted p-4 text-center">
        <p className="text-muted-foreground">
          <a href="/login" className="text-green-600 hover:underline">
            Войдите
          </a>{' '}
          чтобы оставить комментарий
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Напишите комментарий..."
        className="min-h-[100px]"
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          variant="green"
          disabled={isSubmitting || !content.trim()}
        >
          {isSubmitting ? 'Отправка...' : 'Отправить комментарий'}
        </Button>
      </div>
    </form>
  )
}
