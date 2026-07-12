import { Zen_Maru_Gothic } from 'next/font/google'
import './globals.css'
import Footer from './components/Footer'

const zenMaru = Zen_Maru_Gothic({
  weight: ['400', '500', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata = {
  title: 'ケモノプロフィール 🐾',
  description: 'あなたのケモノキャラを紹介しよう！',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={zenMaru.className}>
        <div className="flex flex-col min-h-screen">
          <div className="flex-1">{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  )
}