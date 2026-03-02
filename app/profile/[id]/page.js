'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams } from 'next/navigation'

export default function ProfilePage() {
  const supabase = createClient()
  const { id } = useParams()
  const [profile, setProfile] = useState(null)
  const [events, setEvents] = useState([])

  useEffect(() => {
    const load = async () => {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', id).single()
      setProfile(profile)
      const { data: events } = await supabase.from('events').select('*').eq('profile_id', id).order('event_date')
      if (events) setEvents(events)
    }
    load()
  }, [id])

  if (!profile) return <p className="text-center mt-20">読み込み中...🐾</p>

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー画像 */}
      <div className="w-full h-48 bg-orange-200 relative">
        {profile.header_image_url && (
          <img src={profile.header_image_url} className="w-full h-full object-cover" />
        )}
      </div>

      <div className="max-w-lg mx-auto px-4">
        {/* アイコン */}
        <div className="w-24 h-24 rounded-full bg-orange-300 border-4 border-white -mt-12 overflow-hidden">
          {profile.icon_image_url && (
            <img src={profile.icon_image_url} className="w-full h-full object-cover" />
          )}
        </div>

        <h1 className="text-2xl font-bold mt-3">{profile.display_name}</h1>
        <p className="text-gray-500 text-sm mb-4">🐾 {profile.species}</p>

        {/* 自己紹介 */}
        <div className="bg-white rounded-xl shadow p-5 mb-4">
          <h2 className="font-bold mb-2">自己紹介</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{profile.bio}</p>
        </div>

        {/* プロフィール詳細 */}
        <div className="bg-white rounded-xl shadow p-5 mb-4">
          <h2 className="font-bold mb-3">プロフィール</h2>
          {[
            { label: '性別', value: profile.gender },
            { label: '性格', value: profile.personality },
            { label: '誕生日', value: profile.birthday },
            { label: '種族', value: profile.species },
          ].map(item => (
            <div key={item.label} className="flex mb-2">
              <span className="text-gray-500 w-20 text-sm">{item.label}</span>
              <span className="text-gray-800 text-sm">{item.value}</span>
            </div>
          ))}
        </div>

        {/* イベント */}
        {events.length > 0 && (
          <div className="bg-white rounded-xl shadow p-5 mb-8">
            <h2 className="font-bold mb-3">参加予定イベント 🎪</h2>
            <div className="space-y-3">
              {events.map(event => (
                <div key={event.id} className="border-l-4 border-orange-300 pl-3">
                  <p className="font-bold text-sm">{event.name}</p>
                  {event.event_date && <p className="text-xs text-gray-500">📅 {event.event_date}</p>}
                  {event.location && <p className="text-xs text-gray-500">📍 {event.location}</p>}
                  {event.url && (
                    <a href={event.url} target="_blank" className="text-xs text-blue-400 hover:underline">
                      🔗 詳細リンク
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}