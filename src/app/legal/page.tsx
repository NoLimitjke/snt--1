import type { Metadata } from 'next'
import Link from 'next/link'
import { FileText, Shield, MessageSquare, HelpCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Правовая информация',
  description: 'Правовая информация и документы СНТ №1',
}

const legalDocs = [
  {
    title: 'Устав СНТ',
    description: 'Основной документ, регламентирующий деятельность товарищества. Права и обязанности членов, органы управления, порядок взносов.',
    href: '/ustav',
    icon: FileText,
  },
  {
    title: 'Политика обработки персональных данных',
    description: 'Документ, описывающий порядок сбора, хранения и использования персональных данных в соответствии с 152-ФЗ.',
    href: '/privacy',
    icon: Shield,
  },
  {
    title: 'Вопросы и обращения',
    description: 'Форма для отправки вопросов и обращений в правление СНТ. Личные и общие вопросы.',
    href: '/questions',
    icon: MessageSquare,
  },
  {
    title: 'Частые вопросы (FAQ)',
    description: 'Ответы на часто задаваемые вопросы членов СНТ. Публикуемые вопросы и ответы администрации.',
    href: '/faq',
    icon: HelpCircle,
  },
]

export default function LegalPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-green-700">Правовая информация</h1>
        <p className="text-muted-foreground">
          Официальные документы и информация садового некоммерческого товарищества №1
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {legalDocs.map((doc) => {
          const Icon = doc.icon
          return (
            <Card key={doc.href} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">{doc.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">{doc.description}</CardDescription>
                <Button asChild variant="green" size="sm">
                  <Link href={doc.href}>
                    Открыть
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="rounded-lg bg-green-50 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-green-800">Дополнительные документы</h2>
        <p className="text-sm text-green-700">
          По запросу членов СНТ могут быть предоставлены следующие документы:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-sm text-green-700">
          <li>Положение о членских и целевых взносах</li>
          <li>Регламент проведения общих собраний</li>
          <li>Финансовая отчётность товарищества</li>
          <li>Протоколы общих собраний и заседаний правления</li>
          <li>Договоры с ресурсоснабжающими организациями</li>
        </ul>
        <p className="text-sm text-green-700">
          Для получения копий документов обратитесь в правление СНТ через форму вопросов или на общем собрании.
        </p>
      </div>
    </div>
  )
}
