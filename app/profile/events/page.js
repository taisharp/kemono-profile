'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function EventsPage() {
  const supabase = createClient()
  const router = useRouter()
  const [userId, setUserId] = useState(null)
  const [events, setEvents] = useState([])
  const [form, setForm] = useState({ name: '', event_date: '', location: '', url: '' })
  const [message, setMessage] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)
      const { data } = await supabase.from('events').select('*').eq('profile_id', user.id).order('event_date')
      if (data) setEvents(data)
    }
    load()
  }, [])

  const handleAdd = async () => {
    if (!form.name) { setMessage('イベント名を入力してください'); return }
    const { data, error } = await supabase.from('events').insert({ profile_id: userId, ...form }).select().single()
    if (error) setMessage('エラー: ' + error.message)
    else {
      setEvents([...events, data])
      setForm({ name: '', event_date: '', location: '', url: '' })
      setMessage('追加しました！✅')
    }
  }

  const handleDelete = async (id) => {
    await supabase.from('events').delete().eq('id', id)
    setEvents(events.filter(e => e.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-6">参加予定イベント 🎪</h1>

        {/* 追加フォーム */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="font-bold mb-4">イベントを追加</h2>
          {[
            { key: 'name', label: 'イベント名', type: 'text' },
            { key: 'event_date', label: '日付', type: 'date' },
            { key: 'location', label: '場所', type: 'text' },
            { key: 'url', label: 'URL', type: 'url' },
          ].map(f => (
            <div key={f.key} className="mb-3">
              <label className="block text-sm font-medium mb-1">{f.label}</label>
              <input
                type={f.type}
                className="w-full border rounded-lg p-3"
                value={form[f.key]}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
              />
            </div>
          ))}
          <button
            onClick={handleAdd}
            className="w-full bg-orange-400 text-white rounded-lg p-3 font-bold hover:bg-orange-500"
          >
            追加する
          </button>
          {message && <p className="mt-2 text-center text-sm text-gray-600">{message}</p>}
        </div>

        {/* イベント一覧 */}
        <div className="space-y-3">
          {events.length === 0 && <p className="text-center text-gray-400">イベントがまだありません</p>}
          {events.map(event => (
            <div key={event.id} className="bg-white rounded-xl shadow p-4 flex justify-between items-start">
              <div>
                <p className="font-bold">{event.name}</p>
                {event.event_date && <p className="text-sm text-gray-500">📅 {event.event_date}</p>}
                {event.location && <p className="text-sm text-gray-500">📍 {event.location}</p>}
                {event.url && <a href={event.url} target="_blank" className="text-sm text-blue-400 hover:underline">🔗 詳細リンク</a>}
              </div>
              <button
                onClick={() => handleDelete(event.id)}
                className="text-red-400 hover:text-red-600 text-sm ml-4"
              >
                削除
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={() => router.push(`/profile/${userId}`)}
          className="w-full mt-6 border border-orange-400 text-orange-400 rounded-lg p-3 font-bold hover:bg-orange-50"
        >
          プロフィールを見る
        </button>
      </div>
    </div>
  )
}