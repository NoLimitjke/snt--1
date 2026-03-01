import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t bg-white py-6">
      <div className="container px-4">
        <div className="grid gap-6 md:grid-cols-4">
          {/* Contact info */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-green-700">СНТ №1</p>
            <p className="text-sm text-muted-foreground">
              Адрес: [добавить позже]
            </p>
            <p className="text-sm text-muted-foreground">
              Телефон: [добавить позже]
            </p>
          </div>

          {/* Legal links */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-green-700">Правовая информация</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>
                <Link href="/legal" className="hover:text-green-600 transition-colors">
                  Правовая информация
                </Link>
              </li>
              <li>
                <Link href="/ustav" className="hover:text-green-600 transition-colors">
                  Устав СНТ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-green-600 transition-colors">
                  Политика ПДн
                </Link>
              </li>
            </ul>
          </div>

          {/* Questions */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-green-700">Обращения</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>
                <Link href="/questions" className="hover:text-green-600 transition-colors">
                  Задать вопрос
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-green-600 transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Copyright */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-green-700">О сайте</p>
            <p className="text-sm text-muted-foreground">
              © 2026 Все права защищены
            </p>
            <p className="text-sm text-muted-foreground">
              Разработано на Next.js + Appwrite
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t">
          <p className="text-center text-xs text-muted-foreground">
            Информация на сайте не является публичной офертой. Все документы должны быть утверждены в установленном порядке.
          </p>
        </div>
      </div>
    </footer>
  );
}
