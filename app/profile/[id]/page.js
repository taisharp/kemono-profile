'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams } from 'next/navigation'

const TEMPLATES = {
  default: {
    bg: 'from-orange-50 to-pink-50',
    card: 'bg-white',
    accent: 'bg-orange-100 text-orange-500',
    badge: 'bg-pink-100 text-pink-500',
    tag: 'bg-orange-50',
    tagLabel: 'text-orange-400',
    header: 'from-orange-300 to-pink-300',
    icon: 'from-orange-200 to-pink-200',
    event: 'from-orange-50 to-pink-50 border-orange-100',
    link: 'text-orange-400 hover:text-orange-600',
    arrow: 'text-2xl',
  },
  forest: {
    bg: 'from-green-50 to-emerald-50',
    card: 'bg-white',
    accent: 'bg-green-100 text-green-600',
    badge: 'bg-emerald-100 text-emerald-600',
    tag: 'bg-green-50',
    tagLabel: 'text-green-400',
    header: 'from-green-300 to-emerald-300',
    icon: 'from-green-200 to-emerald-200',
    event: 'from-green-50 to-emerald-50 border-green-100',
    link: 'text-green-500 hover:text-green-700',
    arrow: 'text-2xl',
  },
  ocean: {
    bg: 'from-blue-50 to-cyan-50',
    card: 'bg-white',
    accent: 'bg-blue-100 text-blue-500',
    badge: 'bg-cyan-100 text-cyan-600',
    tag: 'bg-blue-50',
    tagLabel: 'text-blue-400',
    header: 'from-blue-300 to-cyan-300',
    icon: 'from-blue-200 to-cyan-200',
    event: 'from-blue-50 to-cyan-50 border-blue-100',
    link: 'text-blue-400 hover:text-blue-600',
    arrow: 'text-2xl',
  },
  night: {
    bg: 'from-purple-900 to-indigo-900',
    card: 'bg-white/10 backdrop-blur text-white',
    accent: 'bg-purple-700 text-purple-200',
    badge: 'bg-indigo-700 text-indigo-200',
    tag: 'bg-white/10',
    tagLabel: 'text-purple-300',
    header: 'from-purple-700 to-indigo-700',
    icon: 'from-purple-500 to-indigo-500',
    event: 'from-purple-800 to-indigo-800 border-purple-700',
    link: 'text-purple-300 hover:text-purple-100',
    arrow: 'text-2xl',
  },
  cherry: {
    bg: 'from-pink-50 to-rose-50',
    card: 'bg-white',
    accent: 'bg-pink-100 text-pink-500',
    badge: 'bg-rose-100 text-rose-500',
    tag: 'bg-pink-50',
    tagLabel: 'text-pink-400',
    header: 'from-pink-300 to-rose-300',
    icon: 'from-pink-200 to-rose-200',
    event: 'from-pink-50 to-rose-50 border-pink-100',
    link: 'text-pink-400 hover:text-pink-600',
    arrow: 'text-2xl',
  },
  sunset: {
    bg: 'from-orange-100 to-red-100',
    card: 'bg-white',
    accent: 'bg-orange-100 text-orange-600',
    badge: 'bg-red-100 text-red-500',
    tag: 'bg-orange-50',
    tagLabel: 'text-orange-500',
    header: 'from-orange-400 to-red-400',
    icon: 'from-orange-300 to-red-300',
    event: 'from-orange-50 to-red-50 border-orange-100',
    link: 'text-orange-500 hover:text-orange-700',
    arrow: 'text-2xl',
  },
}

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

  const t = TEMPLATES[profile.template] || TEMPLATES.default

  return (
    <div className={`min-h-screen bg-gradient-to-br ${t.bg}`}>

      {/* ヘッダー画像 */}
      <div className={`w-full h-56 bg-gradient-to-r ${t.header} relative overflow-hidden`}>
        {profile.header_image_url
          ? <img src={profile.header_image_url} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">🐾</div>
        }
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      <div className="max-w-xl mx-auto px-4 -mt-16 relative z-10">

        {/* アイコン＋名前カード */}
        <div className={`${t.card} rounded-2xl shadow-lg p-6 mb-4 flex items-end gap-4`}>
          <div className={`w-28 h-28 rounded-2xl bg-gradient-to-br ${t.icon} border-4 border-white shadow-md overflow-hidden flex-shrink-0`}>
            {profile.icon_image_url
              ? <img src={profile.icon_image_url} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-4xl">🐾</div>
            }
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold truncate">{profile.display_name}</h1>
            {profile.species && (
              <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mt-1 ${t.accent}`}>
                🐾 {profile.species}
              </span>
            )}
          </div>
        </div>

        {/* 自己紹介 */}
        {profile.bio && (
          <div className={`${t.card} rounded-2xl shadow-lg p-6 mb-4`}>
            <h2 className="font-bold mb-3 flex items-center gap-2">
              <span className="text-lg">✏️</span> 自己紹介
            </h2>
            <p className="whitespace-pre-wrap leading-relaxed opacity-80">{profile.bio}</p>
          </div>
        )}

        {/* プロフィール詳細 */}
        <div className={`${t.card} rounded-2xl shadow-lg p-6 mb-4`}>
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <span className="text-lg">📋</span> プロフィール
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: '性別', value: profile.gender, emoji: '⚧️' },
              { label: '性格', value: profile.personality, emoji: '💫' },
              { label: '誕生日', value: profile.birthday, emoji: '🎂' },
              { label: '種族', value: profile.species, emoji: '🐾' },
            ].filter(item => item.value).map(item => (
              <div key={item.label} className={`${t.tag} rounded-xl p-3`}>
                <p className={`text-xs font-bold mb-1 ${t.tagLabel}`}>{item.emoji} {item.label}</p>
                <p className="font-medium text-sm">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ギャラリー */}
        {subImages.length > 0 && (
          <div className={`${t.card} rounded-2xl shadow-lg p-6 mb-4`}>
            <h2 className="font-bold mb-4 flex items-center gap-2">
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
          <div className={`${t.card} rounded-2xl shadow-lg p-6 mb-8`}>
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <span className="text-lg">🎪</span> 参加予定イベント
            </h2>
            <div className="space-y-3">
              {events.map(event => (
                <div key={event.id} className={`bg-gradient-to-r ${t.event} rounded-xl p-4 border`}>
                  <p className="font-bold">{event.name}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {event.event_date && (
                      <span className="text-xs bg-white/50 px-2 py-1 rounded-full">📅 {event.event_date}</span>
                    )}
                    {event.location && (
                      <span className="text-xs bg-white/50 px-2 py-1 rounded-full">📍 {event.location}</span>
                    )}
                  </div>
                  {event.url && (
                    <a href={event.url} target="_blank" className={`inline-block mt-2 text-xs font-bold ${t.link}`}>
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