'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'

const TEMPLATES = {
  default: {
    bg: 'from-orange-50 to-pink-50',
    card: 'bg-white text-gray-900',
    accent: 'bg-orange-100 text-orange-500',
    tag: 'bg-orange-50',
    tagLabel: 'text-orange-400',
    header: 'from-orange-300 to-pink-300',
    icon: 'from-orange-200 to-pink-200',
    event: 'from-orange-50 to-pink-50 border-orange-100',
    link: 'text-orange-400 hover:text-orange-600',
  },
  forest: {
    bg: 'from-green-50 to-emerald-50',
    card: 'bg-white text-gray-900',
    accent: 'bg-green-100 text-green-600',
    tag: 'bg-green-50',
    tagLabel: 'text-green-400',
    header: 'from-green-300 to-emerald-300',
    icon: 'from-green-200 to-emerald-200',
    event: 'from-green-50 to-emerald-50 border-green-100',
    link: 'text-green-500 hover:text-green-700',
  },
  ocean: {
    bg: 'from-blue-50 to-cyan-50',
    card: 'bg-white text-gray-900',
    accent: 'bg-blue-100 text-blue-500',
    tag: 'bg-blue-50',
    tagLabel: 'text-blue-400',
    header: 'from-blue-300 to-cyan-300',
    icon: 'from-blue-200 to-cyan-200',
    event: 'from-blue-50 to-cyan-50 border-blue-100',
    link: 'text-blue-400 hover:text-blue-600',
  },
  night: {
    bg: 'from-purple-900 to-indigo-900',
    card: 'bg-white/10 backdrop-blur text-white',
    accent: 'bg-purple-700 text-purple-200',
    tag: 'bg-white/10',
    tagLabel: 'text-purple-300',
    header: 'from-purple-700 to-indigo-700',
    icon: 'from-purple-500 to-indigo-500',
    event: 'from-purple-800 to-indigo-800 border-purple-700',
    link: 'text-purple-300 hover:text-purple-100',
  },
  cherry: {
    bg: 'from-pink-50 to-rose-50',
    card: 'bg-white text-gray-900',
    accent: 'bg-pink-100 text-pink-500',
    tag: 'bg-pink-50',
    tagLabel: 'text-pink-400',
    header: 'from-pink-300 to-rose-300',
    icon: 'from-pink-200 to-rose-200',
    event: 'from-pink-50 to-rose-50 border-pink-100',
    link: 'text-pink-400 hover:text-pink-600',
  },
  sunset: {
    bg: 'from-orange-100 to-red-100',
    card: 'bg-white text-gray-900',
    accent: 'bg-orange-100 text-orange-600',
    tag: 'bg-orange-50',
    tagLabel: 'text-orange-500',
    header: 'from-orange-400 to-red-400',
    icon: 'from-orange-300 to-red-300',
    event: 'from-orange-50 to-red-50 border-orange-100',
    link: 'text-orange-500 hover:text-orange-700',
  },
}

export default function CharacterPage() {
  const supabase = createClient()
  const { id } = useParams()
  const router = useRouter()
  const [character, setCharacter] = useState(null)
  const [events, setEvents] = useState([])
  const [subImages, setSubImages] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('characters').select('*').eq('id', id).single()
      setCharacter(data)
    //   const { data: evs } = await supabase.from('character_events').select('*').eq('character_id', id).order('event_date')
    //   if (evs) setEvents(evs)
    const { data: evs } = await supabase
        .from('character_event_entries')
        .select('*, events(*)')
        .eq('character_id', id)
        .order('created_at')
        if (evs) setEvents(evs)
      const { data: imgs } = await supabase.from('character_images').select('*').eq('character_id', id).order('sort_order')
      if (imgs) setSubImages(imgs)
    }
    load()
  }, [id])

  if (!character) return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-bounce">🐾</div>
        <p className="text-gray-400">読み込み中...</p>
      </div>
    </div>
  )

const t = TEMPLATES[character.template] || TEMPLATES.default

// ===== シンプル（Skeb風）レイアウト =====
  if (character.template === 'simple') {
    return (
      <div className="min-h-screen bg-gray-100">

        {/* ヘッダー画像 */}
        <div className="w-full h-56 md:h-80 bg-gradient-to-r from-gray-200 to-gray-300 relative overflow-hidden">
          {character.header_image_url
            ? <img src={character.header_image_url} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-6xl md:text-8xl opacity-20">🐾</div>
          }
        </div>

        {/* アイコン＋名前エリア */}
        <div className="bg-white border-b border-gray-200 relative z-10">
          <div className="max-w-5xl mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-16 md:-mt-[88px] pb-5 relative z-10">
              {/* アイコン */}
              <div className="w-32 h-32 md:w-44 md:h-44 rounded-full border-4 border-white shadow-lg overflow-hidden bg-orange-100 flex-shrink-0">
                {character.icon_image_url
                  ? <img src={character.icon_image_url} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-5xl">🐾</div>
                }
              </div>
              {/* 名前・自己紹介・SNS */}
              <div className="flex-1 min-w-0 md:pb-2">
                <h1 className="text-2xl md:text-3xl font-black text-gray-800">{character.display_name}</h1>
                {character.bio && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">{character.bio}</p>
                )}
                {/* SNSバッジ */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {character.species && (
                    <span className="inline-flex items-center text-xs font-bold rounded overflow-hidden">
                      <span className="bg-gray-700 text-white px-2 py-1">種族</span>
                      <span className="bg-gray-100 text-gray-600 px-2 py-1">{character.species}</span>
                    </span>
                  )}
                  {character.twitter && (
                    <a href={`https://twitter.com/${character.twitter.replace('@', '')}`} target="_blank"
                      className="inline-flex items-center text-xs font-bold rounded overflow-hidden hover:opacity-80">
                      <span className="bg-black text-white px-2 py-1">𝕏</span>
                      <span className="bg-gray-100 text-gray-600 px-2 py-1">{character.twitter}</span>
                    </a>
                  )}
                  {character.instagram && (
                    <a href={`https://instagram.com/${character.instagram.replace('@', '')}`} target="_blank"
                      className="inline-flex items-center text-xs font-bold rounded overflow-hidden hover:opacity-80">
                      <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1">📷</span>
                      <span className="bg-gray-100 text-gray-600 px-2 py-1">{character.instagram}</span>
                    </a>
                  )}
                  {character.misskey && (
                    <a href={`https://misskey.io/@${character.misskey.replace('@', '')}`} target="_blank"
                      className="inline-flex items-center text-xs font-bold rounded overflow-hidden hover:opacity-80">
                      <span className="bg-green-500 text-white px-2 py-1">🌊</span>
                      <span className="bg-gray-100 text-gray-600 px-2 py-1">{character.misskey}</span>
                    </a>
                  )}
                  {character.website && (
                    <a href={character.website} target="_blank"
                      className="inline-flex items-center text-xs font-bold rounded overflow-hidden hover:opacity-80">
                      <span className="bg-gray-600 text-white px-2 py-1">🌐</span>
                      <span className="bg-gray-100 text-gray-600 px-2 py-1">Web</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* メインエリア：左サイドバー＋右ギャラリー */}
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
          <div className="md:grid md:grid-cols-12 md:gap-6 md:items-start">

            {/* 左サイドバー */}
            <div className="md:col-span-4 space-y-4 mb-6 md:mb-0">

              {/* プロフィール項目 */}
              <div className="bg-white rounded-lg border border-gray-200 p-5 fade-up">
                {[
                  { label: 'ジャンル', value: character.species },
                  { label: '性別', value: character.gender },
                  { label: '性格', value: character.personality },
                  { label: '誕生日', value: character.birthday },
                  { label: 'オーナー', value: character.owner_name },
                  { label: '出身工房', value: character.workshop },
                ].filter(item => item.value).map((item, i, arr) => (
                  <div key={item.label} className={`flex py-2.5 ${i !== arr.length - 1 ? 'border-b border-gray-100' : ''}`}>
                    <span className="text-gray-400 text-sm w-24 flex-shrink-0">{item.label}</span>
                    <span className="text-gray-700 text-sm font-medium">{item.value}</span>
                  </div>
                ))}
              </div>

              {/* 自己紹介（全文） */}
              {character.bio && (
                <div className="bg-white rounded-lg border border-gray-200 p-5 fade-up-delay-1">
                  <h2 className="text-sm font-bold text-gray-700 mb-3 pb-2 border-b border-gray-100">自己紹介</h2>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{character.bio}</p>
                </div>
              )}

              {/* イベント */}
              {events.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-5 fade-up-delay-1">
                  <h2 className="text-sm font-bold text-gray-700 mb-3 pb-2 border-b border-gray-100">🎪 参加予定イベント</h2>
                  <div className="space-y-3">
                    {events.map(entry => (
                      <div
                        key={entry.id}
                        className="border-l-4 border-gray-300 pl-3 cursor-pointer hover:bg-gray-50 rounded-r py-1 transition"
                        onClick={() => router.push(`/events/${entry.event_id}`)}
                      >
                        <p className="font-bold text-gray-700 text-sm">{entry.events?.name}</p>
                        {entry.events?.event_date && <p className="text-xs text-gray-400">📅 {entry.events.event_date}</p>}
                        {entry.events?.location && <p className="text-xs text-gray-400">📍 {entry.events.location}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => router.push('/characters')}
                className="w-full border border-gray-300 text-gray-500 rounded-lg p-3 text-sm font-bold hover:bg-white transition"
              >
                キャラ一覧へ戻る
              </button>
            </div>

            {/* 右メイン：ギャラリー */}
            <div className="md:col-span-8">
              <div className="bg-white rounded-lg border border-gray-200 p-5 fade-up-delay-2">
                <h2 className="text-sm font-bold text-gray-700 pb-3 mb-4 border-b border-gray-200">ギャラリー</h2>
                {subImages.length === 0 ? (
                  <p className="text-center text-gray-300 py-12 text-sm">まだ画像がありません</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {subImages.map(img => (
                      <div
                        key={img.id}
                        className="relative aspect-square overflow-hidden rounded-lg border border-gray-100 cursor-pointer group bg-gray-50"
                        onClick={() => setSelectedImage({ url: img.image_url, caption: img.caption })}
                      >
                        <img src={img.image_url} className="w-full h-full object-cover transition group-hover:scale-105" />
                        {img.caption && (
                          <div className="absolute top-2 left-2 bg-blue-400 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                            {img.caption.slice(0, 8)}{img.caption.length > 8 ? '…' : ''}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 画像拡大モーダル */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={() => setSelectedImage(null)}>
            <div className="max-w-lg md:max-w-2xl w-full" onClick={e => e.stopPropagation()}>
              <img src={selectedImage.url} className="w-full rounded-2xl shadow-2xl" />
              {selectedImage.caption && (
                <div className="bg-white/10 backdrop-blur text-white rounded-2xl p-4 mt-3">
                  <p className="text-sm leading-relaxed">{selectedImage.caption}</p>
                </div>
              )}
              <button onClick={() => setSelectedImage(null)} className="mt-3 w-full text-white/60 hover:text-white text-sm">
                閉じる
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }
  // ===== ここまでシンプルレイアウト =====
return (
    <div className={`min-h-screen bg-gradient-to-br ${t.bg}`}>

      {/* ヘッダー画像（PCでは高く） */}
      <div className={`w-full h-44 md:h-72 bg-gradient-to-r ${t.header} relative overflow-hidden`}>
        {character.header_image_url
          ? <img src={character.header_image_url} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-6xl md:text-8xl opacity-20">🐾</div>
        }
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      <div className="max-w-xl md:max-w-5xl mx-auto px-4 -mt-16 md:-mt-20 relative z-10 pb-12">

        {/* アイコン＋名前カード */}
        <div className={`${t.card} rounded-3xl shadow-xl shadow-black/5 p-6 md:p-8 mb-6 flex items-end gap-4 md:gap-6 fade-up`}>
          <div className={`w-24 h-24 md:w-36 md:h-36 rounded-3xl bg-gradient-to-br ${t.icon} border-4 border-white shadow-lg overflow-hidden flex-shrink-0 ring-4 ring-white/50`}>
            {character.icon_image_url
              ? <img src={character.icon_image_url} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-4xl md:text-6xl">🐾</div>
            }
          </div>
          <div className="flex-1 min-w-0 pb-1">
            <h1 className="text-2xl md:text-4xl font-black truncate tracking-wide">{character.display_name}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              {character.species && (
                <span className={`inline-block text-xs md:text-sm font-bold px-3 py-1 rounded-full ${t.accent}`}>
                  🐾 {character.species}
                </span>
              )}
              {character.workshop && (
                <span className={`inline-block text-xs md:text-sm font-bold px-3 py-1 rounded-full ${t.tag} ${t.tagLabel}`}>
                  🏠 {character.workshop}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* PC：2カラム／スマホ：縦並び */}
        <div className="md:grid md:grid-cols-12 md:gap-6 md:items-start">

          {/* 左カラム：プロフィール情報 */}
          <div className="md:col-span-5 space-y-6">

            {/* 自己紹介 */}
            {character.bio && (
              <div className={`${t.card} rounded-3xl shadow-xl shadow-black/5 p-6 fade-up-delay-1`}>
                <h2 className="font-bold mb-3 flex items-center gap-2 text-lg">
                  <span>✏️</span> 自己紹介
                </h2>
                <p className="whitespace-pre-wrap leading-relaxed opacity-90">{character.bio}</p>
              </div>
            )}

            {/* プロフィール詳細 */}
            <div className={`${t.card} rounded-3xl shadow-xl shadow-black/5 p-6 fade-up-delay-1`}>
              <h2 className="font-bold mb-4 flex items-center gap-2 text-lg">
                <span>📋</span> プロフィール
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: '性別', value: character.gender, emoji: '⚧️' },
                  { label: '性格', value: character.personality, emoji: '💫' },
                  { label: '誕生日', value: character.birthday, emoji: '🎂' },
                  { label: '種族', value: character.species, emoji: '🐾' },
                  { label: 'オーナー', value: character.owner_name, emoji: '👤' },
                  { label: '出身工房', value: character.workshop, emoji: '🏠' },
                ].filter(item => item.value).map(item => (
                  <div key={item.label} className={`${t.tag} rounded-2xl p-3 transition hover:scale-[1.02]`}>
                    <p className={`text-xs font-bold mb-1 ${t.tagLabel}`}>{item.emoji} {item.label}</p>
                    <p className="font-bold text-sm">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* SNSリンク */}
            {(character.twitter || character.instagram || character.misskey || character.website) && (
              <div className={`${t.card} rounded-3xl shadow-xl shadow-black/5 p-6 fade-up-delay-2`}>
                <h2 className="font-bold mb-4 flex items-center gap-2 text-lg">
                  <span>🔗</span> SNS・リンク
                </h2>
                <div className="flex flex-wrap gap-3">
                  {character.twitter && (
                    <a href={`https://twitter.com/${character.twitter.replace('@', '')}`} target="_blank"
                      className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-sm font-bold hover:opacity-80 hover:-translate-y-0.5 transition">
                      𝕏 {character.twitter}
                    </a>
                  )}
                  {character.instagram && (
                    <a href={`https://instagram.com/${character.instagram.replace('@', '')}`} target="_blank"
                      className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold hover:opacity-80 hover:-translate-y-0.5 transition">
                      📷 {character.instagram}
                    </a>
                  )}
                  {character.misskey && (
                    <a href={`https://misskey.io/@${character.misskey.replace('@', '')}`} target="_blank"
                      className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold hover:opacity-80 hover:-translate-y-0.5 transition">
                      🌊 {character.misskey}
                    </a>
                  )}
                  {character.website && (
                    <a href={character.website} target="_blank"
                      className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-full text-sm font-bold hover:opacity-80 hover:-translate-y-0.5 transition">
                      🌐 Webサイト
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 右カラム：ギャラリー＆イベント */}
          <div className="md:col-span-7 space-y-6 mt-6 md:mt-0">

            {/* ギャラリー */}
            {subImages.length > 0 && (
              <div className={`${t.card} rounded-3xl shadow-xl shadow-black/5 p-6 fade-up-delay-2`}>
                <h2 className="font-bold mb-4 flex items-center gap-2 text-lg">
                  <span>🖼️</span> ギャラリー
                </h2>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
                  {subImages.map(img => (
                    <div
                      key={img.id}
                      className="relative aspect-square overflow-hidden rounded-2xl cursor-pointer group"
                      onClick={() => setSelectedImage({ url: img.image_url, caption: img.caption })}
                    >
                      <img src={img.image_url} className="w-full h-full object-cover transition duration-300 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
                      {img.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white text-xs p-2 pt-4 truncate">
                          {img.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* イベント */}
            {events.length > 0 && (
              <div className={`${t.card} rounded-3xl shadow-xl shadow-black/5 p-6 fade-up-delay-3`}>
                <h2 className="font-bold mb-4 flex items-center gap-2 text-lg">
                  <span>🎪</span> 参加予定イベント
                </h2>
                <div className="space-y-3">
                  {events.map(entry => (
                    <div
                      key={entry.id}
                      className={`bg-gradient-to-r ${t.event} rounded-2xl p-4 border cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition`}
                      onClick={() => router.push(`/events/${entry.event_id}`)}
                    >
                      <p className="font-bold">{entry.events?.name}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {entry.events?.event_date && (
                          <span className="text-xs bg-white/60 px-2 py-1 rounded-full font-bold">
                            📅 {entry.events.event_date}
                          </span>
                        )}
                        {entry.events?.location && (
                          <span className="text-xs bg-white/60 px-2 py-1 rounded-full font-bold">
                            📍 {entry.events.location}
                          </span>
                        )}
                      </div>
                      {entry.events?.url && (
                        <a
                          href={entry.events.url}
                          target="_blank"
                          className={`inline-block mt-2 text-xs font-bold ${t.link}`}
                          onClick={e => e.stopPropagation()}
                        >
                          🔗 詳細を見る →
                        </a>
                      )}

                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => router.push('/characters')}
          className="w-full md:max-w-sm md:mx-auto md:block mt-8 border-2 border-orange-400 text-orange-400 rounded-2xl p-3 font-bold hover:bg-orange-50 transition"
        >
          キャラ一覧へ戻る
        </button>

      </div>

      {/* 画像拡大モーダル */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={() => setSelectedImage(null)}>
          <div className="max-w-lg md:max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <img src={selectedImage.url} className="w-full rounded-3xl shadow-2xl" />
            {selectedImage.caption && (
              <div className="bg-white/10 backdrop-blur text-white rounded-2xl p-4 mt-3">
                <p className="text-sm leading-relaxed">{selectedImage.caption}</p>
              </div>
            )}
            <button onClick={() => setSelectedImage(null)} className="mt-3 w-full text-white/60 hover:text-white text-sm">
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  )
}