import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-6 px-4">
      <div className="max-w-5xl mx-auto flex flex-col items-center gap-3">
        <div className="flex gap-6 text-sm">
          <Link href="/" className="text-gray-500 hover:text-gray-800 transition">
            🏠 ホーム
          </Link>
          <Link href="/terms" className="text-gray-500 hover:text-gray-800 transition">
            📄 利用規約
          </Link>
        </div>
        <p className="text-xs text-gray-400">© 2026 ケモノプロフィール 🐾</p>
      </div>
    </footer>
  )
}