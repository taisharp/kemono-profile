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
    <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold text-orange-500 mb-2">🐾 ケモノプロフィール</h1>
      <p className="text-gray-500 mb-10">あなたのケモノキャラを紹介しよう！</p>

      {user ? (
        <div className="bg-white rounded-xl shadow p-8 w-full max-w-sm text-center">
          <p className="text-gray-600 mb-6">ようこそ！<br/><span className="font-bold">{user.email}</span></p>
          <button
            onClick={() => router.push('/profile/edit')}
            className="w-full bg-orange-400 text-white rounded-lg p-3 font-bold hover:bg-orange-500 mb-3"
          >
            プロフィールを編集する
          </button>
          <button
            onClick={() => router.push('/profile/events')}
            className="w-full bg-orange-300 text-white rounded-lg p-3 font-bold hover:bg-orange-400 mb-3"
          >
            イベントを管理する
          </button>
          <button
            onClick={() => router.push(`/profile/${user.id}`)}
            className="w-full border border-orange-400 text-orange-400 rounded-lg p-3 font-bold hover:bg-orange-50 mb-3"
          >
            自分のプロフィールを見る
          </button>
          <button
            onClick={handleLogout}
            className="w-full text-gray-400 text-sm hover:text-gray-600"
          >
            ログアウト
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow p-8 w-full max-w-sm text-center">
          <p className="text-gray-600 mb-6">会員登録してプロフィールを作ろう！</p>
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-orange-400 text-white rounded-lg p-3 font-bold hover:bg-orange-500"
          >
            ログイン / 会員登録
          </button>
        </div>
      )}
    </div>
  )
}