'use client'

import { useState } from 'react'

interface ResultDisplayProps {
  result: {
    japaneseText: string
    englishText: string
    processedImageBase64?: string
    rubyImageBase64?: string
  }
}

export default function ResultDisplay({ result }: ResultDisplayProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // テキストをクリップボードにコピー
  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const imageUrl = result.rubyImageBase64 || result.processedImageBase64

  return (
    <div className="space-y-6">
      {/* 処理済み画像表示 */}
      {imageUrl && (
        <div className="bg-slate-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-slate-800 mb-4">Processed Image</h4>
          <img 
            src={imageUrl} 
            alt="Processed result" 
            className="w-full rounded-lg shadow-md"
          />
        </div>
      )}

      {/* 抽出された日本語テキスト */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-lg font-semibold text-slate-800">
            Original Japanese Text
          </h4>
          <button
            onClick={() => copyToClipboard(result.japaneseText, 'japanese')}
            className="flex items-center text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            {copiedField === 'japanese' ? (
              <>
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
        <div className="bg-slate-50 rounded-md p-4">
          <p className="text-slate-700 whitespace-pre-wrap font-japanese leading-relaxed">
            {result.japaneseText}
          </p>
        </div>
      </div>

      {/* 英語翻訳 */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-lg font-semibold text-slate-800">
            English Translation
          </h4>
          <button
            onClick={() => copyToClipboard(result.englishText, 'english')}
            className="flex items-center text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            {copiedField === 'english' ? (
              <>
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
        <div className="bg-blue-50 rounded-md p-4">
          <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
            {result.englishText}
          </p>
        </div>
      </div>

      {/* 学習ノート */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-amber-900 mb-3">
          Study Notes
        </h4>
        <p className="text-sm text-amber-800 mb-3">
          You can copy the text above for further study. Consider:
        </p>
        <ul className="text-sm text-amber-700 space-y-1">
          <li>• Comparing sentence structures between Japanese and English</li>
          <li>• Looking up unfamiliar kanji or vocabulary</li>
          <li>• Practicing reading the Japanese text aloud</li>
          <li>• Creating flashcards from new words</li>
        </ul>
      </div>
    </div>
  )
}