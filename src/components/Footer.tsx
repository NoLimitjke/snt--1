export function Footer() {
  return (
    <footer className="border-t bg-white py-6">
      <div className="container px-4">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="text-center md:text-left">
            <p className="text-sm font-semibold text-green-700">СНТ №1</p>
            <p className="text-sm text-muted-foreground">
              Адрес: [добавить позже] | Телефон: [добавить позже]
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 Все права защищены | Разработано на Next.js + Appwrite
          </p>
        </div>
      </div>
    </footer>
  );
}
