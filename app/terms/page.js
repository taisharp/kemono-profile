export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 text-gray-900">
      <div className="max-w-2xl mx-auto bg-white rounded-lg border border-gray-200 p-6 md:p-8">
        <h1 className="text-2xl font-black mb-6">利用規約 📄</h1>

        <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
          <section>
            <h2 className="font-bold text-gray-800 mb-2">第1条（適用）</h2>
            <p>本規約は、本サービスの利用に関する条件を定めるものです。利用者は本規約に同意の上、本サービスを利用するものとします。</p>
          </section>

          <section>
            <h2 className="font-bold text-gray-800 mb-2">第2条（禁止事項）</h2>
            <p>利用者は、以下の行為をしてはなりません。</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>法令または公序良俗に違反する行為</li>
              <li>他者の権利を侵害する行為</li>
              <li>他者になりすます行為</li>
              <li>不適切なコンテンツの投稿</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-gray-800 mb-2">第3条（投稿コンテンツ）</h2>
            <p>利用者が投稿した画像・テキスト等の著作権は利用者に帰属します。ただし、本サービスはサービス提供に必要な範囲でこれを利用できるものとします。</p>
          </section>

          <section>
            <h2 className="font-bold text-gray-800 mb-2">第4条（免責事項）</h2>
            <p>本サービスは、利用者間または利用者と第三者との間で生じたトラブルについて一切の責任を負いません。</p>
          </section>

          <section>
            <h2 className="font-bold text-gray-800 mb-2">第5条（規約の変更）</h2>
            <p>本サービスは、必要と判断した場合、利用者に通知することなく本規約を変更できるものとします。</p>
          </section>

          <p className="text-xs text-gray-400 pt-4">制定日：2026年6月13日</p>
        </div>
      </div>
    </div>
  )
}