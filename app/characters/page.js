'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function CharactersPage() {
  const supabase = createClient()
  const router = useRouter()
  const [characters, setCharacters] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase
        .from('characters')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at')
      if (data) setCharacters(data)
      setLoading(false)
    }
    load()
  }, [])

  const handleAdd = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('characters')
      .insert({ user_id: user.id, display_name: '新しいキャラ' })
      .select()
      .single()
    if (!error) router.push(`/characters/${data.id}/edit`)
  }

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-bounce">🐾</div>
        <p className="text-gray-400">読み込み中...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 py-10 px-4 text-gray-900">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-6">🐾 マイキャラ一覧</h1>

        {/* キャラ一覧 */}
        <div className="space-y-3 mb-6">
          {characters.length === 0 && (
            <p className="text-center text-gray-400 py-10">キャラがまだいません！追加してみよう</p>
          )}
          {characters.map(chara => (
            <div key={chara.id} className="bg-white rounded-2xl shadow p-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-200 to-pink-200 overflow-hidden flex-shrink-0">
                {chara.icon_image_url
                  ? <img src={chara.icon_image_url} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-2xl">🐾</div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate">{chara.display_name || '名無し'}</p>
                {chara.species && <p className="text-xs text-gray-400">🐾 {chara.species}</p>}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => router.push(`/characters/${chara.id}/edit`)}
                  className="text-xs bg-orange-100 text-orange-500 font-bold px-3 py-1 rounded-full hover:bg-orange-200"
                >
                  編集
                </button>
                <button
                  onClick={() => router.push(`/characters/${chara.id}`)}
                  className="text-xs bg-gray-100 text-gray-500 font-bold px-3 py-1 rounded-full hover:bg-gray-200"
                >
                  見る
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 追加ボタン */}
        <button
          onClick={handleAdd}
          className="w-full bg-orange-400 text-white rounded-2xl p-4 font-bold hover:bg-orange-500 text-lg"
        >
          ＋ キャラを追加する
        </button>

        <button
          onClick={() => router.push('/')}
          className="w-full mt-3 border border-orange-400 text-orange-400 rounded-2xl p-3 font-bold hover:bg-orange-50"
        >
          トップへ戻る
        </button>
      </div>
    </div>
  )
}