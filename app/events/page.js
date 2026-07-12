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
  const [sortBy, setSortBy] = useState('date')


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

  const sortedEvents = [...events].sort((a, b) => {
  if (sortBy === 'date') {
    // 日付が近い順（未設定は最後）
    if (!a.event_date) return 1
    if (!b.event_date) return -1
    return new Date(a.event_date) - new Date(b.event_date)
  } else {
    // 新着順
    return new Date(b.created_at) - new Date(a.created_at)
  }
})

  if (loading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-bounce">🎪</div>
        <p className="text-gray-400">読み込み中...</p>
      </div>
    </div>
  )

return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 text-gray-900">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-800">🎪 イベント一覧</h1>
            <p className="text-gray-400 text-sm mt-1">参加するイベントを見つけよう</p>
          </div>
          {user && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-700 transition flex-shrink-0"
            >
              ＋ 追加
            </button>
          )}
        </div>

        {/* 並べ替え */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSortBy('date')}
            className={`text-sm font-bold px-4 py-2 rounded-full transition ${
              sortBy === 'date' ? 'bg-gray-800 text-white' : 'bg-white border border-gray-300 text-gray-500 hover:bg-gray-50'
            }`}
          >
            📅 開催日が近い順
          </button>
          <button
            onClick={() => setSortBy('new')}
            className={`text-sm font-bold px-4 py-2 rounded-full transition ${
              sortBy === 'new' ? 'bg-gray-800 text-white' : 'bg-white border border-gray-300 text-gray-500 hover:bg-gray-50'
            }`}
          >
            🆕 新着順
          </button>
        </div>

        {/* イベント追加フォーム */}
        {showForm && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="font-bold mb-4">イベントを追加</h2>
            {[
              { key: 'name', label: 'イベント名*', type: 'text' },
              { key: 'event_date', label: '開催日', type: 'date' },
              { key: 'location', label: '開催場所', type: 'text' },
              { key: 'url', label: 'URL', type: 'url' },
            ].map(f => (
              <div key={f.key} className="mb-3">
                <label className="block text-sm font-medium mb-1">{f.label}</label>
                <input
                  type={f.type}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                />
              </div>
            ))}
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">説明</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-2 h-20"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <button
              onClick={handleAdd}
              className="w-full bg-gray-800 text-white rounded-lg p-3 font-bold hover:bg-gray-700 transition"
            >
              追加する
            </button>
            {message && <p className="mt-2 text-center text-sm text-gray-500">{message}</p>}
          </div>
        )}

        {/* イベント一覧 */}
        {sortedEvents.length === 0 ? (
          <div className="text-center py-20 text-gray-300">
            <p className="text-4xl mb-3">🎪</p>
            <p className="text-sm">イベントがまだありません</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedEvents.map(event => (
              <div
                key={event.id}
                className="bg-white rounded-lg border border-gray-200 p-5 cursor-pointer hover:shadow-sm transition"
                onClick={() => router.push(`/events/${event.id}`)}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-lg text-gray-800 truncate mb-3">{event.name}</h2>

                    {/* 開催日・場所を目立たせる */}
                    <div className="space-y-2">
                      {event.event_date && (
                        <div className="flex items-center gap-2">
                          <span className="bg-gray-700 text-white text-xs font-bold px-2 py-1 rounded flex-shrink-0">📅 開催日</span>
                          <span className="text-sm text-gray-700 font-medium">{event.event_date}</span>
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <span className="bg-gray-700 text-white text-xs font-bold px-2 py-1 rounded flex-shrink-0">📍 場所</span>
                          <span className="text-sm text-gray-700 font-medium truncate">{event.location}</span>
                        </div>
                      )}
                    </div>

                    {event.description && (
                      <p className="text-sm text-gray-400 mt-3 line-clamp-2">{event.description}</p>
                    )}
                  </div>
                  {user && event.created_by === user.id && (
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(event.id) }}
                      className="text-red-400 hover:text-red-600 text-sm flex-shrink-0"
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
          className="w-full mt-8 border border-gray-300 text-gray-500 rounded-lg p-3 font-bold hover:bg-white transition"
        >
          トップへ戻る
        </button>
      </div>
    </div>
  )
}