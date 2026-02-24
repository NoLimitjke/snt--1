import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heart, MessageCircle } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

interface Post {
  $id: string
  title: string
  content: string
  tags: string[]
  $createdAt: string
  author: {
    id: string
    name: string | null
    email: string
  }
  likesCount: number
  commentsCount: number
}

interface PostCardProps {
  post: Post
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

export function PostCard({ post }: PostCardProps) {
  const preview =
    post.content.length > 150
      ? post.content.slice(0, 150) + '...'
      : post.content

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap gap-2 mb-2">
          {post.tags.map((tag) => (
            <Badge key={tag} variant={getTagVariant(tag)}>
              {tag}
            </Badge>
          ))}
        </div>
        <Link href={`/post/${post.$id}`}>
          <h2 className="text-xl font-semibold hover:text-green-600 transition-colors">
            {post.title}
          </h2>
        </Link>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{post.author.name || post.author.email}</span>
          <span>•</span>
          <span>{formatDate(post.$createdAt)}</span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{preview}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Link
          href={`/post/${post.$id}`}
          className="text-sm text-green-600 hover:text-green-700 font-medium"
        >
          Читать далее →
        </Link>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            <span>{post.likesCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            <span>{post.commentsCount}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
