'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { CommentTree } from '@/components/CommentTree'
import { CommentForm } from '@/components/CommentForm'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Heart, MessageCircle, ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return 'Неизвестно'
    }
    return format(date, 'd MMMM yyyy', { locale: ru })
  } catch {
    return 'Неизвестно'
  }
}

function getTagVariant(tag: string) {
  switch (tag) {
    case 'ВАЖНОЕ':
      return 'important'
    case 'СОВЕЩАНИЕ':
      return 'meeting'
    case 'МЕРОПРИЯТИЯ':
      return 'event'
    default:
      return 'default'
  }
}

function PostContent() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postRes, sessionRes] = await Promise.all([
          fetch(`/api/posts/${params.id}`),
          fetch('/api/auth/get-session'),
        ])

        if (postRes.ok) {
          const postData = await postRes.json()
          setPost(postData)
          setLikesCount(postData.likesCount)
        }

        if (sessionRes.ok) {
          const sessionData = await sessionRes.json()
          setSession(sessionData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  const handleLike = async () => {
    if (!session) {
      router.push('/login')
      return
    }

    try {
      const res = await fetch(`/api/posts/${params.id}/like`, {
        method: 'POST',
      })

      if (res.ok) {
        const data = await res.json()
        setLiked(data.liked)
        setLikesCount(data.likesCount)
      }
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-3/4 rounded bg-muted" />
          <div className="h-4 w-1/2 rounded bg-muted" />
          <div className="h-64 rounded bg-muted" />
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-destructive">Пост не найден</h1>
        <Button variant="green" className="mt-4" onClick={() => router.push('/')}>
          На главную
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <Button
        variant="ghost"
        onClick={() => router.push('/')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Назад к списку
      </Button>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-2 mb-2">
            {post.tags.map((tag: string) => (
              <Badge key={tag} variant={getTagVariant(tag)}>
                {tag}
              </Badge>
            ))}
          </div>
          <h1 className="text-3xl font-bold">{post.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{post.author?.name || post.author?.email || 'Аноним'}</span>
            <span>•</span>
            <span>
              {formatDate(post.$createdAt)}
            </span>
          </div>
        </CardHeader>

        <CardContent>
          <div className="prose prose-green max-w-none mb-6">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>

          <div className="flex items-center gap-4 border-t pt-4">
            <Button
              variant={liked ? 'destructive' : 'outline'}
              onClick={handleLike}
            >
              <Heart className={`mr-2 h-4 w-4 ${liked ? 'fill-white' : ''}`} />
              {likesCount}
            </Button>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              <span>{post.commentsCount} комментариев</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Комментарии</h2>
        <CommentForm postId={post.$id} session={session} />
      </div>

      <div className="mt-6">
        <CommentTree
          comments={post.comments || []}
          postId={post.$id}
          session={session}
        />
      </div>
    </div>
  )
}

export default function PostPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Загрузка...</div>}>
      <PostContent />
    </Suspense>
  )
}
