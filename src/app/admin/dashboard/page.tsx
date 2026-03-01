'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, FileText, MessageSquare, Plus } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState({
    users: 0,
    posts: 0,
    questions: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, postsRes, questionsRes] = await Promise.all([
          fetch('/api/admin/users?limit=1'),
          fetch('/api/admin/posts?limit=1'),
          fetch('/api/questions?limit=1'),
        ])

        if (usersRes.ok) {
          const usersData = await usersRes.json()
          setStats((prev) => ({ ...prev, users: usersData.total }))
        }

        if (postsRes.ok) {
          const postsData = await postsRes.json()
          setStats((prev) => ({ ...prev, posts: postsData.total }))
        }

        if (questionsRes.ok) {
          const questionsData = await questionsRes.json()
          setStats((prev) => ({ ...prev, questions: questionsData.total }))
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-700 mb-2">
          Админ-панель
        </h1>
        <p className="text-muted-foreground">
          Управление контентом и пользователями
        </p>
      </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Пользователи
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.users}</div>
                <Link href="/admin/users">
                  <Button variant="link" className="h-auto p-0 text-sm">
                    Управление →
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Посты
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.posts}</div>
                <Link href="/admin/posts">
                  <Button variant="link" className="h-auto p-0 text-sm">
                    Управление →
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Вопросы
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.questions}</div>
                <Link href="/admin/questions">
                  <Button variant="link" className="h-auto p-0 text-sm">
                    Управление →
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Быстрые действия
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/admin/posts">
              <Button variant="green" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Создать пост
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Правовая информация
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/legal" className="block">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Правовая информация
              </Button>
            </Link>
            <Link href="/admin/questions" className="block">
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="mr-2 h-4 w-4" />
                Вопросы и обращения
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
