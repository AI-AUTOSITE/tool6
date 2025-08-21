'use client'

import { useState } from 'react'

export default function ExampleSection() {
  const [activeExample, setActiveExample] = useState(0)

  const examples = [
    {
      title: 'Novel Text',
      description: 'Literary works and novels',
      beforeImage: '/examples/novel-before.jpg',
      afterImage: '/examples/novel-after.jpg',
      japaneseText: '窓の外は静かな夜だった。',
      englishText: 'Outside the window, it was a quiet night.',
    },
    {
      title: 'Manga',
      description: 'Comics and graphic novels',
      beforeImage: '/examples/manga-before.jpg',
      afterImage: '/examples/manga-after.jpg',
      japaneseText: 'まだ始まったばかりだ。',
      englishText: 'It has only just begun.',
    },
    {
      title: 'Signage',
      description: 'Street signs and notices',
      beforeImage: '/examples/sign-before.jpg',
      afterImage: '/examples/sign-after.jpg',
      japaneseText: '立入禁止',
      englishText: 'No Entry',
    },
  ]

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Example Translations</h3>
      
      {/* タブ選択 */}
      <div className="flex space-x-2 mb-4">
        {examples.map((example, index) => (
          <button
            key={index}
            onClick={() => setActiveExample(index)}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              activeExample === index
                ? 'bg-blue-100 text-blue-700'
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            {example.title}
          </button>
        ))}
      </div>

      {/* アクティブな例の表示 */}
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          {examples[activeExample].description}
        </p>
        
        {/* Before/After画像（プレースホルダー） */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-slate-500 mb-1">Before</p>
            <div className="bg-slate-100 rounded-lg p-8 text-center">
              <div className="text-2xl font-japanese text-slate-700">
                {examples[activeExample].japaneseText}
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">After</p>
            <div className="bg-blue-50 rounded-lg p-8 text-center">
              <div className="text-sm text-slate-700">
                {examples[activeExample].englishText}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            These are sample translations. Upload your own image to see the tool in action.
          </p>
        </div>
      </div>
    </div>
  )
}