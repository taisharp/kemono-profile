'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function UserProfileEditPage() {
  const supabase = createClient()
  const router = useRouter()
  const [userId, setUserId] = useState(null)
  const [form, setForm] = useState({
    display_name: '', bio: '', birthday: '', location: '',
    twitter: '', icon_image_url: '', header_image_url: '',
  })
  const [userImages, setUserImages] = useState([])
  const [message, setMessage] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)
      const { data } = await supabase.from('user_profiles').select('*').eq('id', user.id).single()
      if (data) setForm(data)
      const { data: imgs } = await supabase.from('user_images').select('*').eq('user_id', user.id).order('sort_order')
      if (imgs) setUserImages(imgs)
    }
    load()
  }, [])

  const uploadImage = async (file, bucket) => {
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `user_${userId}_${Date.now()}.${ext}`
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const url = await uploadImage(file, 'sub-images')
    if (!url) return
    const { data, error } = await supabase.from('user_images').insert({
      user_id: userId, image_url: url, sort_order: userImages.length
    }).select().single()
    if (!error) setUserImages([...userImages, data])
  }

  const handleImageDelete = async (id) => {
    await supabase.from('user_images').delete().eq('id', id)
    setUserImages(userImages.filter(img => img.id !== id))
  }

  const handleSave = async () => {
    const { error } = await supabase.from('user_profiles').upsert({ id: userId, ...form })
    if (error) setMessage('エラー: ' + error.message)
    else setMessage('保存しました！✅')
  }

  const fields = [
    { key: 'display_name', label: '表示名', type: 'text' },
    { key: 'birthday', label: '誕生日', type: 'date' },
    { key: 'location', label: '住んでいる場所', type: 'text' },
    { key: 'twitter', label: 'X（Twitter）ID', type: 'text' },
  ]

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 text-gray-900">
      <div className="max-w-lg mx-auto bg-white rounded-lg border border-gray-200 p-6 md:p-8">
        <h1 className="text-2xl font-black mb-6">ユーザープロフィール編集 👤</h1>

        {/* ヘッダー画像 */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">ヘッダー画像</label>
          <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden mb-2">
            {form.header_image_url && <img src={form.header_image_url} className="w-full h-full object-cover" />}
          </div>
          <input type="file" accept="image/*" onChange={handleHeaderUpload} />
        </div>

        {/* アイコン */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">アイコン画像</label>
          <div className="w-20 h-20 bg-gray-100 rounded-full overflow-hidden mb-2">
            {form.icon_image_url && <img src={form.icon_image_url} className="w-full h-full object-cover" />}
          </div>
          <input type="file" accept="image/*" onChange={handleIconUpload} />
        </div>

        {uploading && <p className="text-gray-400 text-sm mb-3">アップロード中...⏳</p>}

        {fields.map(f => (
          <div key={f.key} className="mb-4">
            <label className="block text-sm font-medium mb-1">{f.label}</label>
            <input
              type={f.type}
              className="w-full border border-gray-300 rounded-lg p-3"
              value={form[f.key] || ''}
              onChange={e => setForm({ ...form, [f.key]: e.target.value })}
            />
          </div>
        ))}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">自己紹介</label>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 h-32"
            value={form.bio || ''}
            onChange={e => setForm({ ...form, bio: e.target.value })}
          />
        </div>

        {/* ギャラリー */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">ギャラリー</label>
          <div className="space-y-3 mb-3">
            {userImages.map(img => (
              <div key={img.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex gap-3 items-start">
                  <img src={img.image_url} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
                  <div className="flex-1">
                    <textarea
                      placeholder="コメントを入力..."
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm h-16 resize-none"
                      value={img.caption || ''}
                      onChange={e => {
                        const updated = userImages.map(i => i.id === img.id ? { ...i, caption: e.target.value } : i)
                        setUserImages(updated)
                      }}
                      onBlur={async e => {
                        await supabase.from('user_images').update({ caption: e.target.value }).eq('id', img.id)
                      }}
                    />
                  </div>
                  <button onClick={() => handleImageDelete(img.id)} className="text-red-400 hover:text-red-600 text-sm">×</button>
                </div>
              </div>
            ))}
          </div>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-gray-800 text-white rounded-lg p-3 font-bold hover:bg-gray-700 transition"
        >
          保存する
        </button>

        {message && <p className="mt-3 text-center text-sm text-gray-500">{message}</p>}

        <button
          onClick={() => router.push(`/mypage/${userId}`)}
          className="w-full mt-3 border border-gray-300 text-gray-500 rounded-lg p-3 font-bold hover:bg-gray-50 transition"
        >
          プロフィールを見る
        </button>
      </div>
    </div>
  )
}