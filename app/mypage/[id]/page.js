'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'

export default function UserProfilePage() {
  const supabase = createClient()
  const { id } = useParams()
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [characters, setCharacters] = useState([])
  const [userImages, setUserImages] = useState([])
  const [events, setEvents] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      // ユーザープロフィール
      const { data: profile } = await supabase.from('user_profiles').select('*').eq('id', id).single()
      setProfile(profile)

      // 持っているキャラ
      const { data: charas } = await supabase
        .from('characters')
        .select('*')
        .eq('user_id', id)
        .order('created_at')
      if (charas) setCharacters(charas)

      // ユーザーギャラリー
      const { data: imgs } = await supabase.from('user_images').select('*').eq('user_id', id).order('sort_order')
      if (imgs) setUserImages(imgs)

      // 参加予定イベント（自分のキャラが参加してるイベントをまとめる）
      if (charas && charas.length > 0) {
        const charaIds = charas.map(c => c.id)
        const { data: entries } = await supabase
          .from('character_event_entries')
          .select('*, events(*), characters(display_name)')
          .in('character_id', charaIds)
        if (entries) {
          // イベントごとにまとめる（重複排除）
          const eventMap = {}
          entries.forEach(e => {
            if (!e.events) return
            if (!eventMap[e.event_id]) {
              eventMap[e.event_id] = { ...e.events, characters: [] }
            }
            eventMap[e.event_id].characters.push(e.characters?.display_name)
          })
          setEvents(Object.values(eventMap))
        }
      }

      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-bounce">👤</div>
        <p className="text-gray-400">読み込み中...</p>
      </div>
    </div>
  )

  if (!profile) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <p className="text-gray-400">プロフィールが見つかりません</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ヘッダー画像 */}
      <div className="w-full h-56 md:h-80 bg-gradient-to-r from-gray-200 to-gray-300 relative overflow-hidden">
        {profile.header_image_url
          ? <img src={profile.header_image_url} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-6xl md:text-8xl opacity-20">👤</div>
        }
      </div>

      {/* アイコン＋名前エリア */}
      <div className="bg-white border-b border-gray-200 relative z-10">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-16 md:-mt-[88px] pb-5 relative z-10">
            <div className="w-32 h-32 md:w-44 md:h-44 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 flex-shrink-0">
              {profile.icon_image_url
                ? <img src={profile.icon_image_url} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-5xl">👤</div>
              }
            </div>
<div className="flex-1 min-w-0 md:pb-2">
              <h1 className="text-2xl md:text-3xl font-black text-gray-800">{profile.display_name}</h1>
              {profile.bio && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">{profile.bio}</p>
              )}
              {/* 誕生日・場所 */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
                {profile.birthday && <span>🎂 {profile.birthday}</span>}
                {profile.location && <span>📍 {profile.location}</span>}
              </div>
              {/* SNS */}
              <div className="flex flex-wrap gap-2 mt-3">
                {profile.twitter && (
                  <a href={`https://twitter.com/${profile.twitter.replace('@', '')}`} target="_blank"
                    className="inline-flex items-center text-xs font-bold rounded overflow-hidden hover:opacity-80">
                    <span className="bg-black text-white px-2 py-1">𝕏</span>
                    <span className="bg-gray-100 text-gray-600 px-2 py-1">{profile.twitter}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* メインエリア */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
        <div className="md:grid md:grid-cols-12 md:gap-6 md:items-start">

          {/* 左サイドバー */}
          <div className="md:col-span-4 space-y-4 mb-6 md:mb-0">

            {/* プロフィール項目 */}
            {/* <div className="bg-white rounded-lg border border-gray-200 p-5 fade-up">
              {[
                { label: '誕生日', value: profile.birthday },
                { label: '住んでいる場所', value: profile.location },
              ].filter(item => item.value).map((item, i, arr) => (
                <div key={item.label} className={`flex py-2.5 ${i !== arr.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <span className="text-gray-400 text-sm w-28 flex-shrink-0">{item.label}</span>
                  <span className="text-gray-700 text-sm font-medium">{item.value}</span>
                </div>
              ))}
            </div> */}

            {/* 自己紹介 */}
            {profile.bio && (
              <div className="bg-white rounded-lg border border-gray-200 p-5 fade-up-delay-1">
                <h2 className="text-sm font-bold text-gray-700 mb-3 pb-2 border-b border-gray-100">自己紹介</h2>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
              </div>
            )}

            {/* 持っているキャラ一覧 */}
            <div className="bg-white rounded-lg border border-gray-200 p-5 fade-up">
              <h2 className="text-sm font-bold text-gray-700 pb-3 mb-4 border-b border-gray-200">
                🐾 キャラクター（{characters.length}体）
              </h2>
              {characters.length === 0 ? (
                <p className="text-center text-gray-300 py-8 text-sm">まだキャラがいません</p>
              ) : (
<div className="space-y-2">
  {characters.map(chara => (
    <div
      key={chara.id}
      className="flex items-center gap-3 border border-gray-100 rounded-lg p-2 cursor-pointer hover:shadow-sm hover:bg-gray-50 transition"
      onClick={() => router.push(`/characters/${chara.id}`)}
    >
      <div className="w-12 h-12 rounded-lg bg-gray-50 overflow-hidden flex-shrink-0">
        {chara.icon_image_url
          ? <img src={chara.icon_image_url} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-xl">🐾</div>
        }
      </div>
      <div className="min-w-0">
        <p className="font-bold text-gray-700 text-sm truncate">{chara.display_name || '名無し'}</p>
        {chara.species && <p className="text-xs text-gray-400 truncate">{chara.species}</p>}
      </div>
    </div>
  ))}
</div>
              )}
            </div>

            {/* 参加予定イベント */}
            {events.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-5 fade-up-delay-1">
                <h2 className="text-sm font-bold text-gray-700 mb-3 pb-2 border-b border-gray-100">🎪 参加予定イベント</h2>
                <div className="space-y-3">
                  {events.map(event => (
                    <div
                      key={event.id}
                      className="border-l-4 border-gray-300 pl-3 cursor-pointer hover:bg-gray-50 rounded-r py-1 transition"
                      onClick={() => router.push(`/events/${event.id}`)}
                    >
                      <p className="font-bold text-gray-700 text-sm">{event.name}</p>
                      {event.event_date && <p className="text-xs text-gray-400">📅 {event.event_date}</p>}
                      {event.characters.length > 0 && (
                        <p className="text-xs text-gray-400">🐾 {event.characters.filter(Boolean).join('、')}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 右メイン */}
          <div className="md:col-span-8 space-y-4">

            {/* 持っているキャラ一覧
            <div className="bg-white rounded-lg border border-gray-200 p-5 fade-up-delay-1">
              <h2 className="text-sm font-bold text-gray-700 pb-3 mb-4 border-b border-gray-200">
                🐾 キャラクター（{characters.length}体）
              </h2>
              {characters.length === 0 ? (
                <p className="text-center text-gray-300 py-8 text-sm">まだキャラがいません</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {characters.map(chara => (
                    <div
                      key={chara.id}
                      className="border border-gray-100 rounded-lg overflow-hidden cursor-pointer hover:shadow-sm transition group"
                      onClick={() => router.push(`/characters/${chara.id}`)}
                    >
                      <div className="w-full aspect-square bg-gray-50 overflow-hidden">
                        {chara.icon_image_url
                          ? <img src={chara.icon_image_url} className="w-full h-full object-cover group-hover:scale-105 transition" />
                          : <div className="w-full h-full flex items-center justify-center text-3xl">🐾</div>
                        }
                      </div>
                      <div className="p-2">
                        <p className="font-bold text-gray-700 text-sm truncate">{chara.display_name || '名無し'}</p>
                        {chara.species && <p className="text-xs text-gray-400 truncate">{chara.species}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div> */}

            {/* ギャラリー */}
            {userImages.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-5 fade-up-delay-2">
                <h2 className="text-sm font-bold text-gray-700 pb-3 mb-4 border-b border-gray-200">ギャラリー</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {userImages.map(img => (
                    <div
                      key={img.id}
                      className="relative aspect-square overflow-hidden rounded-lg border border-gray-100 cursor-pointer group bg-gray-50"
                      onClick={() => setSelectedImage({ url: img.image_url, caption: img.caption })}
                    >
                      <img src={img.image_url} className="w-full h-full object-cover transition group-hover:scale-105" />
                      {img.caption && (
                        <div className="absolute top-2 left-2 bg-blue-400 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                          {img.caption.slice(0, 8)}{img.caption.length > 8 ? '…' : ''}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => router.push('/')}
          className="w-full md:max-w-sm md:mx-auto md:block mt-6 border border-gray-300 text-gray-500 rounded-lg p-3 font-bold hover:bg-white transition"
        >
          トップへ戻る
        </button>
      </div>

      {/* 画像拡大モーダル */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={() => setSelectedImage(null)}>
          <div className="max-w-lg md:max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <img src={selectedImage.url} className="w-full rounded-2xl shadow-2xl" />
            {selectedImage.caption && (
              <div className="bg-white/10 backdrop-blur text-white rounded-2xl p-4 mt-3">
                <p className="text-sm leading-relaxed">{selectedImage.caption}</p>
              </div>
            )}
            <button onClick={() => setSelectedImage(null)} className="mt-3 w-full text-white/60 hover:text-white text-sm">
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  )
}