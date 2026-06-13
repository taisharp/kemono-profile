'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ProfilesPage() {
  const supabase = createClient()
  const router = useRouter()
  const [characters, setCharacters] = useState([])
  const [subImages, setSubImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: charas } = await supabase
        .from('characters')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
      if (charas) setCharacters(charas)

      const { data: imgs } = await supabase
        .from('character_images')
        .select('*')
        .order('sort_order')
      if (imgs) setSubImages(imgs)

      setLoading(false)
    }
    load()
  }, [])

const filtered = characters.filter(c =>
  c.display_name?.toLowerCase().includes(search.toLowerCase()) ||
  c.species?.toLowerCase().includes(search.toLowerCase()) ||
  c.workshop?.toLowerCase().includes(search.toLowerCase()) ||
  c.owner_name?.toLowerCase().includes(search.toLowerCase())
)

  const getSubImages = (characterId) =>
    subImages.filter(img => img.character_id === characterId).slice(0, 3)

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-bounce">🐾</div>
        <p className="text-gray-400">読み込み中...</p>
      </div>
    </div>
  )

return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 text-gray-900">
      <div className="max-w-2xl mx-auto">

        {/* タイトル */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-gray-800 mb-1">🐾 キャラクター検索</h1>
          <p className="text-gray-400 text-sm">登録されているケモノキャラを探そう</p>
        </div>

        {/* 検索 */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 mb-4 flex items-center gap-3">
          <span className="text-gray-400 text-lg pl-2">🔍</span>
          <input
            type="text"
            placeholder="名前・種族・出身工房・オーナー名で検索..."
            className="flex-1 outline-none text-gray-700 text-sm"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600 pr-2">×</button>
          )}
        </div>

        {/* 件数 */}
        <p className="text-sm text-gray-400 mb-4 pl-1">
          {filtered.length}体のキャラが見つかりました
        </p>

        {/* 一覧 */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-300">
            <p className="text-4xl mb-3">🐾</p>
            <p className="text-sm">キャラが見つかりません</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filtered.map(chara => (
              <div
                key={chara.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden cursor-pointer hover:shadow-sm transition group"
                onClick={() => router.push(`/characters/${chara.id}`)}
              >
                {/* ヘッダー画像 */}
                <div className="w-full h-20 bg-gradient-to-r from-gray-200 to-gray-300 relative overflow-hidden">
                  {chara.header_image_url && (
                    <img src={chara.header_image_url} className="w-full h-full object-cover group-hover:scale-105 transition" />
                  )}
                </div>

                <div className="p-3">
                  {/* アイコン */}
                  <div className="w-16 h-16 rounded-full bg-gray-100 border-4 border-white shadow-sm overflow-hidden -mt-10 mb-2">
                    {chara.icon_image_url
                      ? <img src={chara.icon_image_url} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-xl">🐾</div>
                    }
                  </div>

                  {/* 名前 */}
                  <h2 className="font-black text-gray-800 truncate text-base leading-tight mb-2">
                    {chara.display_name || '名無し'}
                  </h2>

                  {/* 種族・工房・オーナー（Skeb風2色バッジ） */}
                  <div className="flex flex-col gap-1 mb-2">
                    {chara.species && (
                      <span className="inline-flex items-center text-xs font-bold rounded overflow-hidden self-start">
                        <span className="bg-gray-700 text-white px-2 py-0.5">種族</span>
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 truncate">{chara.species}</span>
                      </span>
                    )}
                    {chara.workshop && (
                      <span className="inline-flex items-center text-xs font-bold rounded overflow-hidden self-start">
                        <span className="bg-gray-700 text-white px-2 py-0.5">工房</span>
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 truncate">{chara.workshop}</span>
                      </span>
                    )}
                    {chara.owner_name && (
                      <span className="inline-flex items-center text-xs font-bold rounded overflow-hidden self-start">
                        <span className="bg-gray-700 text-white px-2 py-0.5">主</span>
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 truncate">{chara.owner_name}</span>
                      </span>
                    )}
                  </div>

                  {/* サブ画像 */}
                  {getSubImages(chara.id).length > 0 && (
                    <div className="flex gap-1">
                      {getSubImages(chara.id).map(img => (
                        <div key={img.id} className="w-10 h-10 rounded border border-gray-100 overflow-hidden flex-shrink-0">
                          <img src={img.image_url} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
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