'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async () => {
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage(error.message)
      else setMessage('確認メールを送りました！')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
      else router.push('/profile/edit')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {isSignUp ? '会員登録' : 'ログイン'} 🐾
        </h1>
        <input
          type="email"
          placeholder="メールアドレス"
          className="w-full border rounded-lg p-3 mb-3"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="パスワード"
          className="w-full border rounded-lg p-3 mb-4"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button
          onClick={handleAuth}
          className="w-full bg-orange-400 text-white rounded-lg p-3 font-bold hover:bg-orange-500"
        >
          {isSignUp ? '登録する' : 'ログイン'}
        </button>
        {message && <p className="mt-3 text-center text-sm text-gray-600">{message}</p>}
        <p
          className="mt-4 text-center text-sm text-blue-500 cursor-pointer"
          onClick={() => setIsSignUp(!isSignUp)}
        >
          {isSignUp ? 'ログインはこちら' : '会員登録はこちら'}
        </p>
      </div>
    </div>
  )
}