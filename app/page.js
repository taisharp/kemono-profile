'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    load()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  if (loading) return <p className="text-center mt-20">読み込み中...🐾</p>

return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-gray-800 mb-2">🐾 ケモノプロフィール</h1>
        <p className="text-gray-400 text-sm">あなたのケモノキャラを紹介しよう</p>
      </div>

      {user ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6 w-full max-w-sm">
          <p className="text-gray-500 text-sm text-center mb-5">
            ようこそ<br/><span className="font-bold text-gray-700">{user.email}</span>
          </p>
          <button
            onClick={() => router.push('/characters')}
            className="w-full bg-gray-800 text-white rounded-lg p-3 font-bold hover:bg-gray-700 mb-2 transition"
          >
            🐾 マイキャラを管理する
          </button>
          <button
            onClick={() => router.push('/profiles')}
            className="w-full bg-white border border-gray-300 text-gray-600 rounded-lg p-3 font-bold hover:bg-gray-50 mb-2 transition"
          >
            キャラクター検索
          </button>
          <button
            onClick={() => router.push('/events')}
            className="w-full bg-white border border-gray-300 text-gray-600 rounded-lg p-3 font-bold hover:bg-gray-50 mb-4 transition"
          >
            🎪 イベント一覧
          </button>

<button
  onClick={() => router.push('/mypage/edit')}
  className="w-full bg-white border border-gray-300 text-gray-600 rounded-lg p-3 font-bold hover:bg-gray-50 mb-2 transition"
>
  👤 マイプロフィールを編集
</button>

          <button
            onClick={handleLogout}
            className="w-full text-gray-400 text-sm hover:text-gray-600 transition"
          >
            ログアウト
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-6 w-full max-w-sm text-center">
          <p className="text-gray-500 text-sm mb-5">会員登録してプロフィールを作ろう</p>
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-gray-800 text-white rounded-lg p-3 font-bold hover:bg-gray-700 transition"
          >
            ログイン / 会員登録
          </button>
        </div>
      )}
    </div>
  )
}