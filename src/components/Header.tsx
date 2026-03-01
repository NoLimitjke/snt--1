'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, FileText, Shield, MessageSquare, HelpCircle } from 'lucide-react'

interface Session {
  user: {
    id: string
    email: string
    name?: string | null
    role?: string
  }
}

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/get-session')
      .then((res) => res.json())
      .then((data) => {
        setSession(data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  const isAdmin = session?.user?.role === 'ADMIN'

  const handleLogout = async () => {
    await fetch('/api/auth/sign-out', {
      method: 'POST',
    })
    setSession(null)
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-lg font-bold text-green-700">СНТ №1</span>
        </Link>

        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-4">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-green-600 ${
                pathname === '/' ? 'text-green-600' : 'text-muted-foreground'
              }`}
            >
              Главная
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-green-600">
                  Информация
                  <ChevronDown className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/legal" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Правовая информация
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/ustav" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Устав СНТ
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/privacy" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Политика ПДн
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/questions" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Вопросы и обращения
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/faq" className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    FAQ
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {isAdmin && (
              <Link
                href="/admin/dashboard"
                className={`text-sm font-medium transition-colors hover:text-green-600 ${
                  pathname?.startsWith('/admin')
                    ? 'text-green-600'
                    : 'text-muted-foreground'
                }`}
              >
                Админ-панель
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2 border-l pl-4">
            {loading ? (
              <div className="h-8 w-20 animate-pulse rounded bg-muted" />
            ) : session ? (
              <>
                <span className="text-sm text-muted-foreground">
                  {session.user.name || session.user.email}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                >
                  Выйти
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button variant="green" size="sm">
                  Войти
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
