'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function EventsPage() {
  const supabase = createClient()
  const router = useRouter()
  const [events, setEvents] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', event_date: '', location: '', url: '', description: '' })
  const [message, setMessage] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      const { data } = await supabase.from('events').select('*').order('event_date')
      if (data) setEvents(data)
      setLoading(false)
    }
    load()
  }, [])

  const handleAdd = async () => {
    if (!form.name) { setMessage('イベント名を入力してください'); return }
    const { data, error } = await supabase.from('events').insert({
      ...form, created_by: user.id
    }).select().single()
    if (error) setMessage('エラー: ' + error.message)
    else {
      setEvents([...events, data])
      setForm({ name: '', event_date: '', location: '', url: '', description: '' })
      setShowForm(false)
      setMessage('イベントを追加しました！✅')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('このイベントを削除しますか？')) return
    await supabase.from('events').delete().eq('id', id)
    setEvents(events.filter(e => e.id !== id))
  }

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-bounce">🎪</div>
        <p className="text-gray-400">読み込み中...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 py-10 px-4 text-gray-900">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">🎪 イベント一覧</h1>
          {user && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-orange-400 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-orange-500"
            >
              ＋ 追加
            </button>
          )}
        </div>

        {/* イベント追加フォーム */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow p-6 mb-6">
            <h2 className="font-bold mb-4">イベントを追加</h2>
            {[
              { key: 'name', label: 'イベント名*', type: 'text' },
              { key: 'event_date', label: '日付', type: 'date' },
              { key: 'location', label: '場所', type: 'text' },
              { key: 'url', label: 'URL', type: 'url' },
            ].map(f => (
              <div key={f.key} className="mb-3">
                <label className="block text-sm font-medium mb-1">{f.label}</label>
                <input
                  type={f.type}
                  className="w-full border rounded-lg p-2"
                  value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                />
              </div>
            ))}
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">説明</label>
              <textarea
                className="w-full border rounded-lg p-2 h-20"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <button
              onClick={handleAdd}
              className="w-full bg-orange-400 text-white rounded-lg p-3 font-bold hover:bg-orange-500"
            >
              追加する
            </button>
            {message && <p className="mt-2 text-center text-sm text-gray-500">{message}</p>}
          </div>
        )}

        {/* イベント一覧 */}
        {events.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">🎪</p>
            <p>イベントがまだありません</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map(event => (
              <div
                key={event.id}
                className="bg-white rounded-2xl shadow p-5 cursor-pointer hover:shadow-lg transition"
                onClick={() => router.push(`/events/${event.id}`)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-lg truncate">{event.name}</h2>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {event.event_date && (
                        <span className="text-xs bg-orange-100 text-orange-500 px-2 py-1 rounded-full">
                          📅 {event.event_date}
                        </span>
                      )}
                      {event.location && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                          📍 {event.location}
                        </span>
                      )}
                    </div>
                    {event.description && (
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">{event.description}</p>
                    )}
                  </div>
                  {user && event.created_by === user.id && (
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(event.id) }}
                      className="text-red-400 hover:text-red-600 text-sm ml-3 flex-shrink-0"
                    >
                      削除
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => router.push('/')}
          className="w-full mt-8 border border-orange-400 text-orange-400 rounded-2xl p-3 font-bold hover:bg-orange-50"
        >
          トップへ戻る
        </button>
      </div>
    </div>
  )
}