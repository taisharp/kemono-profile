'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ProfilesPage() {
  const supabase = createClient()
  const router = useRouter()
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
      if (data) setProfiles(data)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = profiles.filter(p =>
    p.display_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.species?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-bounce">🐾</div>
        <p className="text-gray-400">読み込み中...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* タイトル */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🐾 みんなのプロフィール</h1>
          <p className="text-gray-500">登録されているケモノキャラ一覧</p>
        </div>

        {/* 検索 */}
        <div className="bg-white rounded-2xl shadow p-3 mb-6 flex items-center gap-3">
          <span className="text-gray-400 text-xl pl-2">🔍</span>
          <input
            type="text"
            placeholder="名前や種族で検索..."
            className="flex-1 outline-none text-gray-700"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* 一覧 */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">🐾</p>
            <p>プロフィールが見つかりません</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filtered.map(profile => (
              <div
                key={profile.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition group"
                onClick={() => router.push(`/profile/${profile.id}`)}
              >
                {/* ヘッダー画像 */}
                <div className="w-full h-24 bg-gradient-to-r from-orange-200 to-pink-200 relative overflow-hidden">
                  {profile.header_image_url && (
                    <img src={profile.header_image_url} className="w-full h-full object-cover group-hover:scale-105 transition" />
                  )}
                </div>

                <div className="p-4 flex items-center gap-4 -mt-8">
                  {/* アイコン */}
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-200 to-pink-200 border-4 border-white shadow overflow-hidden flex-shrink-0">
                    {profile.icon_image_url
                      ? <img src={profile.icon_image_url} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-2xl">🐾</div>
                    }
                  </div>

                  {/* 情報 */}
                  <div className="flex-1 min-w-0 mt-6">
                    <h2 className="font-bold text-gray-800 truncate">{profile.display_name || '名無し'}</h2>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {profile.species && (
                        <span className="text-xs bg-orange-100 text-orange-500 font-bold px-2 py-0.5 rounded-full">
                          🐾 {profile.species}
                        </span>
                      )}
                      {profile.gender && (
                        <span className="text-xs bg-pink-100 text-pink-500 font-bold px-2 py-0.5 rounded-full">
                          {profile.gender}
                        </span>
                      )}
                    </div>
                    {profile.bio && (
                      <p className="text-xs text-gray-400 mt-1 truncate">{profile.bio}</p>
                    )}
                  </div>

                  <span className="text-orange-300 group-hover:text-orange-500 transition text-xl flex-shrink-0">→</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* トップへ戻る */}
        <button
          onClick={() => router.push('/')}
          className="w-full mt-8 border border-orange-400 text-orange-400 rounded-xl p-3 font-bold hover:bg-orange-50"
        >
          トップへ戻る
        </button>
      </div>
    </div>
  )
}