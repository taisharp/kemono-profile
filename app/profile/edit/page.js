'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const TEMPLATES = [
  { id: 'default', name: 'ノーマル', emoji: '🐾', bg: 'from-orange-50 to-pink-50', accent: 'orange' },
  { id: 'forest', name: 'フォレスト', emoji: '🌿', bg: 'from-green-50 to-emerald-50', accent: 'green' },
  { id: 'ocean', name: 'オーシャン', emoji: '🌊', bg: 'from-blue-50 to-cyan-50', accent: 'blue' },
  { id: 'night', name: 'ナイト', emoji: '🌙', bg: 'from-purple-900 to-indigo-900', accent: 'purple' },
  { id: 'cherry', name: 'さくら', emoji: '🌸', bg: 'from-pink-50 to-rose-50', accent: 'pink' },
  { id: 'sunset', name: 'サンセット', emoji: '🌅', bg: 'from-orange-100 to-red-100', accent: 'red' },
]

export default function EditProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  const [userId, setUserId] = useState(null)
  const [form, setForm] = useState({
    display_name: '',
    bio: '',
    gender: '',
    personality: '',
    birthday: '',
    species: '',
    icon_image_url: '',
    header_image_url: '',
    template: 'default',
  })
  const [subImages, setSubImages] = useState([])
  const [message, setMessage] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) setForm(data)
      const { data: images } = await supabase.from('profile_images').select('*').eq('profile_id', user.id).order('sort_order')
      if (images) setSubImages(images)
    }
    load()
  }, [])

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
    const { data, error } = await supabase.from('profile_images').insert({
      profile_id: userId,
      image_url: url,
      sort_order: subImages.length
    }).select().single()
    if (error) setMessage('エラー: ' + error.message)
    else {
      setSubImages([...subImages, data])
      setMessage('サブ画像を追加しました！✅')
    }
  }

  const handleSubImageDelete = async (id) => {
    await supabase.from('profile_images').delete().eq('id', id)
    setSubImages(subImages.filter(img => img.id !== id))
  }

  const handleSave = async () => {
    const { error } = await supabase.from('profiles').upsert({ id: userId, ...form })
    if (error) setMessage('エラー: ' + error.message)
    else setMessage('保存しました！✅')
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
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold mb-6">プロフィール編集 🐾</h1>

        {/* テンプレート選択 */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3">🎨 テンプレート選択</label>
          <div className="grid grid-cols-3 gap-2">
            {TEMPLATES.map(t => (
              <button
                key={t.id}
                onClick={() => setForm({ ...form, template: t.id })}
                className={`p-3 rounded-xl border-2 transition text-center ${
                  form.template === t.id
                    ? 'border-orange-400 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-200'
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
            {form.header_image_url && (
              <img src={form.header_image_url} className="w-full h-full object-cover" />
            )}
          </div>
          <input type="file" accept="image/*" onChange={handleHeaderUpload} />
        </div>

        {/* アイコン */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">アイコン画像</label>
          <div className="w-20 h-20 bg-orange-200 rounded-full overflow-hidden mb-2">
            {form.icon_image_url && (
              <img src={form.icon_image_url} className="w-full h-full object-cover" />
            )}
          </div>
          <input type="file" accept="image/*" onChange={handleIconUpload} />
        </div>

        {uploading && <p className="text-orange-400 text-sm mb-3">アップロード中...⏳</p>}

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
                        const updated = subImages.map(i =>
                          i.id === img.id ? { ...i, caption: e.target.value } : i
                        )
                        setSubImages(updated)
                      }}
                      onBlur={async e => {
                        await supabase.from('profile_images').update({ caption: e.target.value }).eq('id', img.id)
                      }}
                    />
                  </div>
                  <button
                    onClick={() => handleSubImageDelete(img.id)}
                    className="text-red-400 hover:text-red-600 text-sm flex-shrink-0"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
          <input type="file" accept="image/*" onChange={handleSubImageUpload} />
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-orange-400 text-white rounded-lg p-3 font-bold hover:bg-orange-500"
        >
          保存する
        </button>

        {message && <p className="mt-3 text-center text-sm text-gray-600">{message}</p>}

        <button
          onClick={() => router.push(`/profile/${userId}`)}
          className="w-full mt-3 border border-orange-400 text-orange-400 rounded-lg p-3 font-bold hover:bg-orange-50"
        >
          プロフィールを見る
        </button>
      </div>
    </div>
  )
}