'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Heart, Reply } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

interface Comment {
  $id: string
  content: string
  $createdAt: string
  author: {
    id: string
    name: string | null
    email: string
  }
  replies: Comment[]
  likesCount?: number
}

interface CommentTreeProps {
  comments: Comment[]
  postId: string
  session: any
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return 'Неизвестно'
    }
    return format(date, 'd MMM yyyy, HH:mm', { locale: ru })
  } catch {
    return 'Неизвестно'
  }
}

export function CommentTree({ comments, postId, session }: CommentTreeProps) {
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set())
  const [commentsLikes, setCommentsLikes] = useState<Record<string, number>>({})

  const handleReply = async (parentId: string) => {
    if (!replyContent.trim()) return

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: replyContent,
          postId,
          parentId,
        }),
      })

      if (res.ok) {
        setReplyContent('')
        setReplyTo(null)
        window.location.reload()
      }
    } catch (error) {
      console.error('Error creating reply:', error)
    }
  }

  const handleLike = async (commentId: string) => {
    if (!session) return

    try {
      const res = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
      })

      if (res.ok) {
        const data = await res.json()
        setLikedComments((prev) => {
          const next = new Set(prev)
          if (data.liked) {
            next.add(commentId)
          } else {
            next.delete(commentId)
          }
          return next
        })
        setCommentsLikes((prev) => ({ ...prev, likesCount: data.likesCount }))
      }
    } catch (error) {
      console.error('Error liking comment:', error)
    }
  }

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.$id} className={`${isReply ? 'ml-8 mt-4' : ''}`}>
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {comment.author?.name || comment.author?.email || 'Аноним'}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDate(comment.$createdAt)}
            </span>
          </div>
        </div>
        <p className="mt-2 text-sm">{comment.content}</p>
        <div className="mt-3 flex items-center gap-4">
          {session && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLike(comment.$id)}
                className={`h-6 ${likedComments.has(comment.$id) ? 'text-red-500' : ''}`}
              >
                <Heart className="h-4 w-4 mr-1" />
                {comment.likesCount || 0}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyTo(replyTo === comment.$id ? null : comment.$id)}
                className="h-6"
              >
                <Reply className="h-4 w-4 mr-1" />
                Ответить
              </Button>
            </>
          )}
        </div>

        {replyTo === comment.$id && session && (
          <div className="mt-3">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Напишите ответ..."
              className="min-h-[80px]"
            />
            <div className="mt-2 flex gap-2">
              <Button
                size="sm"
                variant="green"
                onClick={() => handleReply(comment.$id)}
              >
                Отправить
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setReplyTo(null)}
              >
                Отмена
              </Button>
            </div>
          </div>
        )}
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply) => renderComment(reply, true))}
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-4">
      {comments.map((comment) => renderComment(comment))}
    </div>
  )
}
