'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams } from 'next/navigation'

export default function ProfilePage() {
  const supabase = createClient()
  const { id } = useParams()
  const [profile, setProfile] = useState(null)
  const [events, setEvents] = useState([])
  const [subImages, setSubImages] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    const load = async () => {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', id).single()
      setProfile(profile)
      const { data: events } = await supabase.from('events').select('*').eq('profile_id', id).order('event_date')
      if (events) setEvents(events)
      const { data: images } = await supabase.from('profile_images').select('*').eq('profile_id', id).order('sort_order')
      if (images) setSubImages(images)
    }
    load()
  }, [id])

  if (!profile) return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-bounce">🐾</div>
        <p className="text-gray-400">読み込み中...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">

      {/* ヘッダー画像 */}
      <div className="w-full h-56 bg-gradient-to-r from-orange-300 to-pink-300 relative overflow-hidden">
        {profile.header_image_url
          ? <img src={profile.header_image_url} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">🐾</div>
        }
        {/* グラデーションオーバーレイ */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      <div className="max-w-xl mx-auto px-4 -mt-16 relative z-10">

        {/* アイコン＋名前カード */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 flex items-end gap-4">
          <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-orange-200 to-pink-200 border-4 border-white shadow-md overflow-hidden flex-shrink-0">
            {profile.icon_image_url
              ? <img src={profile.icon_image_url} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-4xl">🐾</div>
            }
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-800 truncate">{profile.display_name}</h1>
            {profile.species && (
              <span className="inline-block bg-orange-100 text-orange-500 text-xs font-bold px-3 py-1 rounded-full mt-1">
                🐾 {profile.species}
              </span>
            )}
          </div>
        </div>

        {/* 自己紹介 */}
        {profile.bio && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
            <h2 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span className="text-lg">✏️</span> 自己紹介
            </h2>
            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* プロフィール詳細 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
          <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span className="text-lg">📋</span> プロフィール
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: '性別', value: profile.gender, emoji: '⚧️' },
              { label: '性格', value: profile.personality, emoji: '💫' },
              { label: '誕生日', value: profile.birthday, emoji: '🎂' },
              { label: '種族', value: profile.species, emoji: '🐾' },
            ].filter(item => item.value).map(item => (
              <div key={item.label} className="bg-orange-50 rounded-xl p-3">
                <p className="text-xs text-orange-400 font-bold mb-1">{item.emoji} {item.label}</p>
                <p className="text-gray-700 font-medium text-sm">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ギャラリー */}
        {subImages.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
            <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <span className="text-lg">🖼️</span> ギャラリー
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {subImages.map(img => (
                <div
                  key={img.id}
                  className="relative aspect-square overflow-hidden rounded-xl cursor-pointer group"
                  onClick={() => setSelectedImage(img.image_url)}
                >
                  <img src={img.image_url} className="w-full h-full object-cover transition group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* イベント */}
        {events.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <span className="text-lg">🎪</span> 参加予定イベント
            </h2>
            <div className="space-y-3">
              {events.map(event => (
                <div key={event.id} className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl p-4 border border-orange-100">
                  <p className="font-bold text-gray-800">{event.name}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {event.event_date && (
                      <span className="text-xs bg-white text-gray-500 px-2 py-1 rounded-full border">
                        📅 {event.event_date}
                      </span>
                    )}
                    {event.location && (
                      <span className="text-xs bg-white text-gray-500 px-2 py-1 rounded-full border">
                        📍 {event.location}
                      </span>
                    )}
                  </div>
                  {event.url && (
                    <a href={event.url} target="_blank" className="inline-block mt-2 text-xs text-orange-400 hover:text-orange-600 font-bold">
                      🔗 詳細を見る →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* 画像拡大モーダル */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img src={selectedImage} className="max-w-full max-h-full rounded-2xl shadow-2xl" />
          <button className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300">×</button>
        </div>
      )}
    </div>
  )
}