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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-bounce">🎪</div>
        <p className="text-gray-400">読み込み中...</p>
      </div>
    </div>
  )

  if (!event) return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center">
      <p className="text-gray-400">イベントが見つかりません</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 py-10 px-4 text-gray-900">
      <div className="max-w-lg mx-auto">

        {/* イベント情報 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold mb-3">{event.name}</h1>
          <div className="flex flex-wrap gap-2 mb-3">
            {event.event_date && (
              <span className="text-sm bg-orange-100 text-orange-500 px-3 py-1 rounded-full font-bold">
                📅 {event.event_date}
              </span>
            )}
            {event.location && (
              <span className="text-sm bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
                📍 {event.location}
              </span>
            )}
          </div>
          {event.description && (
            <p className="text-gray-600 leading-relaxed mb-3">{event.description}</p>
          )}
          {event.url && (
            <a href={event.url} target="_blank"
              className="inline-block text-sm text-orange-400 hover:text-orange-600 font-bold">
              🔗 詳細リンク →
            </a>
          )}
        </div>

        {/* 自分のキャラで参加登録 */}
        {user && myCharacters.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="font-bold mb-4">🐾 参加するキャラを選ぶ</h2>
            <div className="space-y-3">
              {myCharacters.map(chara => (
                <div key={chara.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 overflow-hidden flex-shrink-0">
                      {chara.icon_image_url
                        ? <img src={chara.icon_image_url} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center">🐾</div>
                      }
                    </div>
                    <p className="font-bold text-sm">{chara.display_name}</p>
                  </div>
                  <button
                    onClick={() => handleToggleEntry(chara)}
                    className={`text-sm font-bold px-4 py-2 rounded-full transition ${
                      isEntered(chara.id)
                        ? 'bg-orange-400 text-white hover:bg-red-400'
                        : 'bg-gray-100 text-gray-500 hover:bg-orange-100 hover:text-orange-500'
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
          <div className="bg-white rounded-2xl shadow p-5 mb-6 text-center">
            <p className="text-gray-500 mb-3">参加登録するにはログインが必要です</p>
            <button
              onClick={() => router.push('/login')}
              className="bg-orange-400 text-white px-6 py-2 rounded-full font-bold hover:bg-orange-500"
            >
              ログインする
            </button>
          </div>
        )}

        {/* 参加キャラ一覧 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="font-bold mb-4">🎉 参加キャラ一覧（{entries.length}体）</h2>
          {entries.length === 0 ? (
            <p className="text-center text-gray-400 py-4">まだ参加キャラがいません</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {entries.map(entry => (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 bg-orange-50 rounded-xl p-3 cursor-pointer hover:bg-orange-100 transition"
                  onClick={() => router.push(`/characters/${entry.character_id}`)}
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-200 overflow-hidden flex-shrink-0">
                    {entry.characters?.icon_image_url
                      ? <img src={entry.characters.icon_image_url} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center">🐾</div>
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate">{entry.characters?.display_name}</p>
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
          className="w-full border border-orange-400 text-orange-400 rounded-2xl p-3 font-bold hover:bg-orange-50"
        >
          イベント一覧へ戻る
        </button>
      </div>
    </div>
  )
}