'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'

const TEMPLATES = [
  { id: 'default', name: 'ノーマル', emoji: '🐾', bg: 'from-orange-50 to-pink-50' },
  { id: 'forest', name: 'フォレスト', emoji: '🌿', bg: 'from-green-50 to-emerald-50' },
  { id: 'ocean', name: 'オーシャン', emoji: '🌊', bg: 'from-blue-50 to-cyan-50' },
  { id: 'night', name: 'ナイト', emoji: '🌙', bg: 'from-purple-900 to-indigo-900' },
  { id: 'cherry', name: 'さくら', emoji: '🌸', bg: 'from-pink-50 to-rose-50' },
  { id: 'sunset', name: 'サンセット', emoji: '🌅', bg: 'from-orange-100 to-red-100' },
]

export default function EditCharacterPage() {
  const supabase = createClient()
  const router = useRouter()
  const { id } = useParams()
  const [form, setForm] = useState({
    display_name: '', bio: '', gender: '', personality: '',
    birthday: '', species: '', owner_name: '', workshop: '',
    twitter: '', instagram: '', misskey: '', website: '',
    icon_image_url: '', header_image_url: '', template: 'default',
  })
  const [subImages, setSubImages] = useState([])
  const [events, setEvents] = useState([])
  const [eventForm, setEventForm] = useState({ name: '', event_date: '', location: '', url: '' })
  const [message, setMessage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)
      const { data } = await supabase.from('characters').select('*').eq('id', id).single()
      if (data) setForm(data)
      const { data: images } = await supabase.from('character_images').select('*').eq('character_id', id).order('sort_order')
      if (images) setSubImages(images)
      const { data: evs } = await supabase.from('character_events').select('*').eq('character_id', id).order('event_date')
      if (evs) setEvents(evs)
    }
    load()
  }, [id])

  const uploadImage = async (file, bucket) => {
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${userId}_${Date.now()}.${ext}`
    const { error } = await supabase.storage.from(bucket).upload(path, file)
    if (error) { setMessage('アップロード失敗: ' + error.message); setUploading(false); return null }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    setUploading(false)
    return data.publicUrl
  }

  const handleIconUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const url = await uploadImage(file, 'avatars')
    if (url) setForm({ ...form, icon_image_url: url })
  }

  const handleHeaderUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const url = await uploadImage(file, 'headers')
    if (url) setForm({ ...form, header_image_url: url })
  }

  const handleSubImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const url = await uploadImage(file, 'sub-images')
    if (!url) return
    const { data, error } = await supabase.from('character_images').insert({
      character_id: id, image_url: url, sort_order: subImages.length
    }).select().single()
    if (!error) setSubImages([...subImages, data])
  }

  const handleSubImageDelete = async (imgId) => {
    await supabase.from('character_images').delete().eq('id', imgId)
    setSubImages(subImages.filter(img => img.id !== imgId))
  }

  const handleAddEvent = async () => {
    if (!eventForm.name) return
    const { data, error } = await supabase.from('character_events').insert({
      character_id: id, ...eventForm
    }).select().single()
    if (!error) {
      setEvents([...events, data])
      setEventForm({ name: '', event_date: '', location: '', url: '' })
      setMessage('イベントを追加しました！✅')
    }
  }

  const handleDeleteEvent = async (evId) => {
    await supabase.from('character_events').delete().eq('id', evId)
    setEvents(events.filter(e => e.id !== evId))
  }

  const handleSave = async () => {
    const { error } = await supabase.from('characters').update({ ...form }).eq('id', id)
    if (error) setMessage('エラー: ' + error.message)
    else setMessage('保存しました！✅')
  }

  const handleDelete = async () => {
    if (!confirm('このキャラを削除しますか？')) return
    await supabase.from('characters').delete().eq('id', id)
    router.push('/characters')
  }

const fields = [
  { key: 'display_name', label: 'キャラ名', type: 'text' },
  { key: 'species', label: '種族', type: 'text' },
  { key: 'gender', label: '性別', type: 'text' },
  { key: 'personality', label: '性格', type: 'text' },
  { key: 'birthday', label: '誕生日', type: 'date' },
  { key: 'owner_name', label: 'オーナー名', type: 'text' },
  { key: 'workshop', label: '出身工房', type: 'text' },
  { key: 'twitter', label: 'X（Twitter）ID', type: 'text' },
  { key: 'instagram', label: 'Instagram ID', type: 'text' },
  { key: 'misskey', label: 'Misskey ID', type: 'text' },
  { key: 'website', label: 'WebサイトURL', type: 'url' },
]

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 text-gray-900">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold mb-6">キャラ編集 🐾</h1>

        {/* テンプレート選択 */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3">🎨 テンプレート</label>
          <div className="grid grid-cols-3 gap-2">
            {TEMPLATES.map(t => (
              <button
                key={t.id}
                onClick={() => setForm({ ...form, template: t.id })}
                className={`p-3 rounded-xl border-2 transition text-center ${
                  form.template === t.id ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-orange-200'
                }`}
              >
                <div className={`w-full h-8 rounded-lg bg-gradient-to-r ${t.bg} mb-2`} />
                <p className="text-xs font-bold text-gray-600">{t.emoji} {t.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* ヘッダー画像 */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">ヘッダー画像</label>
          <div className="w-full h-32 bg-orange-100 rounded-lg overflow-hidden mb-2">
            {form.header_image_url && <img src={form.header_image_url} className="w-full h-full object-cover" />}
          </div>
          <input type="file" accept="image/*" onChange={handleHeaderUpload} />
        </div>

        {/* アイコン */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">アイコン画像</label>
          <div className="w-20 h-20 bg-orange-200 rounded-full overflow-hidden mb-2">
            {form.icon_image_url && <img src={form.icon_image_url} className="w-full h-full object-cover" />}
          </div>
          <input type="file" accept="image/*" onChange={handleIconUpload} />
        </div>

        {uploading && <p className="text-orange-400 text-sm mb-3">アップロード中...⏳</p>}

        {/* フィールド */}
        {fields.map(f => (
          <div key={f.key} className="mb-4">
            <label className="block text-sm font-medium mb-1">{f.label}</label>
            <input
              type={f.type}
              className="w-full border rounded-lg p-3"
              value={form[f.key] || ''}
              onChange={e => setForm({ ...form, [f.key]: e.target.value })}
            />
          </div>
        ))}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">自己紹介</label>
          <textarea
            className="w-full border rounded-lg p-3 h-32"
            value={form.bio || ''}
            onChange={e => setForm({ ...form, bio: e.target.value })}
          />
        </div>
        
        <div className="mb-4">
            <label className="block text-sm font-medium mb-1">💕 ここすき</label>
            <textarea
              className="w-full border rounded-lg p-3 h-24"
              placeholder="好きなもの・こと・場所など自由に！"
              value={form.favorite_things || ''}
              onChange={e => setForm({ ...form, favorite_things: e.target.value })}
            />
          </div>


        {/* サブ画像 */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">サブ画像</label>
          <div className="space-y-3 mb-3">
            {subImages.map(img => (
              <div key={img.id} className="border rounded-xl p-3">
                <div className="flex gap-3 items-start">
                  <img src={img.image_url} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
                  <div className="flex-1">
                    <textarea
                      placeholder="コメントを入力..."
                      className="w-full border rounded-lg p-2 text-sm h-16 resize-none"
                      value={img.caption || ''}
                      onChange={e => {
                        const updated = subImages.map(i => i.id === img.id ? { ...i, caption: e.target.value } : i)
                        setSubImages(updated)
                      }}
                      onBlur={async e => {
                        await supabase.from('character_images').update({ caption: e.target.value }).eq('id', img.id)
                      }}
                    />
                  </div>
                  <button onClick={() => handleSubImageDelete(img.id)} className="text-red-400 hover:text-red-600 text-sm">×</button>
                </div>
              </div>
            ))}
          </div>
          <input type="file" accept="image/*" onChange={handleSubImageUpload} />
        </div>

        {/* イベント */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">🎪 参加予定イベント</label>
          <div className="space-y-2 mb-3">
            {events.map(ev => (
              <div key={ev.id} className="flex items-center justify-between bg-orange-50 rounded-xl p-3">
                <div>
                  <p className="font-bold text-sm">{ev.name}</p>
                  {ev.event_date && <p className="text-xs text-gray-400">📅 {ev.event_date}</p>}
                </div>
                <button onClick={() => handleDeleteEvent(ev.id)} className="text-red-400 hover:text-red-600 text-sm">削除</button>
              </div>
            ))}
          </div>
          {[
            { key: 'name', label: 'イベント名', type: 'text' },
            { key: 'event_date', label: '日付', type: 'date' },
            { key: 'location', label: '場所', type: 'text' },
            { key: 'url', label: 'URL', type: 'url' },
          ].map(f => (
            <div key={f.key} className="mb-2">
              <input
                type={f.type}
                placeholder={f.label}
                className="w-full border rounded-lg p-2 text-sm"
                value={eventForm[f.key]}
                onChange={e => setEventForm({ ...eventForm, [f.key]: e.target.value })}
              />
            </div>
          ))}
          <button
            onClick={handleAddEvent}
            className="w-full bg-orange-200 text-orange-700 rounded-lg p-2 text-sm font-bold hover:bg-orange-300"
          >
            ＋ イベントを追加
          </button>
        </div>

        <button onClick={handleSave} className="w-full bg-orange-400 text-white rounded-lg p-3 font-bold hover:bg-orange-500">
          保存する
        </button>

        {message && <p className="mt-3 text-center text-sm text-gray-600">{message}</p>}

        <button
          onClick={() => router.push(`/characters/${id}`)}
          className="w-full mt-3 border border-orange-400 text-orange-400 rounded-lg p-3 font-bold hover:bg-orange-50"
        >
          プロフィールを見る
        </button>

        <button
          onClick={() => router.push('/characters')}
          className="w-full mt-3 border border-gray-300 text-gray-400 rounded-lg p-3 font-bold hover:bg-gray-50"
        >
          キャラ一覧へ戻る
        </button>

        <button onClick={handleDelete} className="w-full mt-6 text-red-400 text-sm hover:text-red-600">
          このキャラを削除する
        </button>
      </div>
    </div>
  )
}