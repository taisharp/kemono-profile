'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'

export default function EventDetailPage() {
  const supabase = createClient()
  const { id } = useParams()
  const router = useRouter()
  const [event, setEvent] = useState(null)
  const [entries, setEntries] = useState([])
  const [myCharacters, setMyCharacters] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      // イベント取得
      const { data: event } = await supabase.from('events').select('*').eq('id', id).single()
      setEvent(event)

      // 参加キャラ取得
      const { data: entries } = await supabase
        .from('character_event_entries')
        .select('*, characters(*)')
        .eq('event_id', id)
      if (entries) setEntries(entries)

      // 自分のキャラ取得
      if (user) {
        const { data: myCharas } = await supabase
          .from('characters')
          .select('*')
          .eq('user_id', user.id)
        if (myCharas) setMyCharacters(myCharas)
      }

      setLoading(false)
    }
    load()
  }, [id])

  const isEntered = (characterId) => entries.some(e => e.character_id === characterId)

  const handleToggleEntry = async (character) => {
    if (isEntered(character.id)) {
      // 参加取り消し
      await supabase.from('character_event_entries')
        .delete()
        .eq('event_id', id)
        .eq('character_id', character.id)
      setEntries(entries.filter(e => e.character_id !== character.id))
    } else {
      // 参加登録
      const { data, error } = await supabase.from('character_event_entries')
        .insert({ event_id: id, character_id: character.id })
        .select('*, characters(*)')
        .single()
      if (!error) setEntries([...entries, data])
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-bounce">🎪</div>
        <p className="text-gray-400">読み込み中...</p>
      </div>
    </div>
  )

  if (!event) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <p className="text-gray-400">イベントが見つかりません</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 text-gray-900">
      <div className="max-w-lg mx-auto">

        {/* イベント情報 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h1 className="text-2xl font-black text-gray-800 mb-3">{event.name}</h1>
          <div className="space-y-2 mb-3">
            {event.event_date && (
              <div className="flex items-center gap-2">
                <span className="bg-gray-700 text-white text-xs font-bold px-2 py-1 rounded flex-shrink-0">📅 開催日</span>
                <span className="text-sm text-gray-700 font-medium">{event.event_date}</span>
              </div>
            )}
            {event.location && (
              <div className="flex items-center gap-2">
                <span className="bg-gray-700 text-white text-xs font-bold px-2 py-1 rounded flex-shrink-0">📍 場所</span>
                <span className="text-sm text-gray-700 font-medium">{event.location}</span>
              </div>
            )}
          </div>
          {event.description && (
            <p className="text-gray-500 text-sm leading-relaxed mb-3 whitespace-pre-wrap">{event.description}</p>
          )}
          {event.url && (
            <a href={event.url} target="_blank"
              className="inline-block text-sm text-gray-500 hover:text-gray-800 font-bold transition">
              🔗 詳細リンク →
            </a>
          )}

          {/* 地図 */}
          {event.location && (
            <div className="mt-4">
              <iframe
                width="100%"
                height="250"
                className="rounded-lg border border-gray-200"
                loading="lazy"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(event.location)}&output=embed`}
              />
            </div>
          )}
        </div>

        {/* 自分のキャラで参加登録 */}
        {user && myCharacters.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-sm font-bold text-gray-700 mb-4 pb-2 border-b border-gray-100">🐾 参加するキャラを選ぶ</h2>
            <div className="space-y-3">
              {myCharacters.map(chara => (
                <div key={chara.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                      {chara.icon_image_url
                        ? <img src={chara.icon_image_url} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center">🐾</div>
                      }
                    </div>
                    <p className="font-bold text-sm text-gray-700">{chara.display_name}</p>
                  </div>
                  <button
                    onClick={() => handleToggleEntry(chara)}
                    className={`text-sm font-bold px-4 py-2 rounded-lg transition ${
                      isEntered(chara.id)
                        ? 'bg-gray-800 text-white hover:bg-red-500'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {isEntered(chara.id) ? '✅ 参加中' : '＋ 参加する'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!user && (
          <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6 text-center">
            <p className="text-gray-500 text-sm mb-3">参加登録するにはログインが必要です</p>
            <button
              onClick={() => router.push('/login')}
              className="bg-gray-800 text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-700 transition"
            >
              ログインする
            </button>
          </div>
        )}

        {/* 参加キャラ一覧 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-sm font-bold text-gray-700 mb-4 pb-2 border-b border-gray-100">🎉 参加キャラ一覧（{entries.length}体）</h2>
          {entries.length === 0 ? (
            <p className="text-center text-gray-300 py-4 text-sm">まだ参加キャラがいません</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {entries.map(entry => (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 border border-gray-100 rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => router.push(`/characters/${entry.character_id}`)}
                >
                  <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                    {entry.characters?.icon_image_url
                      ? <img src={entry.characters.icon_image_url} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center">🐾</div>
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-gray-700 truncate">{entry.characters?.display_name}</p>
                    {entry.characters?.species && (
                      <p className="text-xs text-gray-400 truncate">🐾 {entry.characters.species}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => router.push('/events')}
          className="w-full border border-gray-300 text-gray-500 rounded-lg p-3 font-bold hover:bg-white transition"
        >
          イベント一覧へ戻る
        </button>
      </div>
    </div>
  )
}
