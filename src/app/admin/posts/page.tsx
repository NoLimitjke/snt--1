'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface Post {
  $id: string
  title: string
  tags: string[]
  author: {
    name: string | null
    email: string
  }
  $createdAt: string
  commentsCount: number
  likesCount: number
}

const TAGS = ['ВАЖНОЕ', 'СОВЕЩАНИЕ', 'МЕРОПРИЯТИЯ']

export default function PostsPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [] as string[],
  })

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/posts?limit=50')
      const data = await res.json()
      setPosts(data.posts)
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.content) {
      toast.error('Заполните все обязательные поля')
      return
    }

    try {
      const url = editingPost
        ? `/api/posts/${editingPost.$id}`
        : '/api/posts'
      const method = editingPost ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast.success(editingPost ? 'Пост обновлен' : 'Пост создан')
        setIsCreateOpen(false)
        setEditingPost(null)
        setFormData({ title: '', content: '', tags: [] })
        fetchPosts()
      } else {
        toast.error('Ошибка при сохранении')
      }
    } catch (error) {
      console.error('Error saving post:', error)
      toast.error('Ошибка при сохранении')
    }
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот пост?')) return

    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('Пост удален')
        fetchPosts()
      } else {
        toast.error('Ошибка при удалении')
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      toast.error('Ошибка при удалении')
    }
  }

  const handleEdit = (post: Post) => {
    setEditingPost(post)
    setFormData({
      title: post.title,
      content: '',
      tags: post.tags,
    })
    setIsCreateOpen(true)
  }

  const toggleTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }))
  }

  const getTagVariant = (tag: string) => {
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

  return (
    <div className="space-y-8">
      <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-green-700 mb-2">
              Управление постами
            </h1>
            <p className="text-muted-foreground">
              Создание и редактирование постов
            </p>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button variant="green" onClick={() => {
                setEditingPost(null)
                setFormData({ title: '', content: '', tags: [] })
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Создать пост
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPost ? 'Редактировать пост' : 'Создать пост'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Заголовок *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Введите заголовок"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Контент (Markdown) *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    placeholder="Введите контент поста..."
                    className="min-h-[200px]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Теги</Label>
                  <div className="flex flex-wrap gap-2">
                    {TAGS.map((tag) => (
                      <Badge
                        key={tag}
                        variant={
                          formData.tags.includes(tag)
                            ? getTagVariant(tag)
                            : 'outline'
                        }
                        className="cursor-pointer"
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                  >
                    Отмена
                  </Button>
                  <Button type="submit" variant="green">
                    {editingPost ? 'Сохранить' : 'Создать'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Посты ({posts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded bg-muted" />
                ))}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Заголовок</TableHead>
                      <TableHead>Теги</TableHead>
                      <TableHead>Автор</TableHead>
                      <TableHead>Комментарии</TableHead>
                      <TableHead>Лайки</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map((post) => (
                      <TableRow key={post.$id}>
                        <TableCell className="font-medium max-w-[300px]">
                          <div className="truncate">{post.title}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {post.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant={getTagVariant(tag)}
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {post.author.name || post.author.email}
                        </TableCell>
                        <TableCell>{post.commentsCount}</TableCell>
                        <TableCell>{post.likesCount}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(post)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(post.$id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  )
}
