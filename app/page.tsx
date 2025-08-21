'use client'

import { useState } from 'react'
import ImageUploader from '@/components/ImageUploader'
import ResultDisplay from '@/components/ResultDisplay'
import ExampleSection from '@/components/ExampleSection'

// 翻訳結果の型定義
interface TranslationResult {
  japaneseText: string
  englishText: string
  processedImageBase64?: string
  rubyImageBase64?: string
}

export default function Home() {
  const [result, setResult] = useState<TranslationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // アップロード処理
  const handleUpload = async (file: File, rubyMode: boolean) => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      // FormDataを作成
      const formData = new FormData()
      formData.append('file', file)
      formData.append('rubyMode', rubyMode.toString())

      // APIに送信
      const response = await fetch('/api/translate', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Translation failed')
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred during translation')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-serif text-slate-800">
                <span className="text-blue-700">日英</span> Image Translator
              </h1>
              <span className="ml-3 text-sm text-slate-500">Academic Tool</span>
            </div>
            <nav className="flex space-x-8">
              <a href="#about" className="text-slate-600 hover:text-blue-700 transition-colors">
                About
              </a>
              <a href="#guide" className="text-slate-600 hover:text-blue-700 transition-colors">
                User Guide
              </a>
              <a href="#contact" className="text-slate-600 hover:text-blue-700 transition-colors">
                Contact
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* タイトルセクション */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif text-slate-800 mb-4">
            Japanese to English Image Translator
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            An academic tool for students and researchers studying Japanese language and culture.
            Upload images containing Japanese text for instant, accurate English translations.
          </p>
        </div>

        {/* メイン機能エリア */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左側：アップロードと結果 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload & Translate
              </h3>

              {/* 使用上の注意 */}
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
                <p className="text-sm text-amber-800">
                  <strong>Academic Use Only:</strong> This tool is designed for educational and research purposes.
                  Please ensure you have the right to use any uploaded images. Images are processed in memory only and not stored.
                </p>
              </div>

              {/* アップローダー */}
              <ImageUploader 
                onUpload={handleUpload}
                isLoading={isLoading}
                error={error}
              />

              {/* 結果表示 */}
              {result && (
                <div className="mt-8">
                  <ResultDisplay result={result} />
                </div>
              )}
            </div>

            {/* 使い方ガイド */}
            <div id="guide" className="bg-white rounded-xl shadow-md p-8 mt-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">How to Use</h3>
              <ol className="space-y-3 text-slate-600">
                <li className="flex">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mr-3 font-semibold">1</span>
                  <span>Select a JPG or PNG image containing Japanese text (max 10MB)</span>
                </li>
                <li className="flex">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mr-3 font-semibold">2</span>
                  <span>Choose whether to display ruby text (furigana with English) or English-only overlay</span>
                </li>
                <li className="flex">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mr-3 font-semibold">3</span>
                  <span>Click "Translate Image" and wait for processing</span>
                </li>
                <li className="flex">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mr-3 font-semibold">4</span>
                  <span>View and copy the extracted text and translation</span>
                </li>
              </ol>
            </div>
          </div>

          {/* 右側：例とリソース */}
          <div className="lg:col-span-1">
            {/* サンプル画像 */}
            <ExampleSection />

            {/* このツールについて */}
            <div id="about" className="bg-white rounded-xl shadow-md p-6 mt-8">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">About This Tool</h3>
              <div className="space-y-3 text-sm text-slate-600">
                <p>
                  This translator uses advanced AI technology to accurately extract and translate Japanese text from images.
                </p>
                <div className="pt-3 border-t border-slate-200">
                  <h4 className="font-semibold text-slate-700 mb-2">Features:</h4>
                  <ul className="space-y-1">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      High-accuracy OCR using Google Vision API
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      Natural translations powered by GPT-4
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      Support for vertical and horizontal text
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      Ruby text option for language learners
                    </li>
                  </ul>
                </div>
                <div className="pt-3 border-t border-slate-200">
                  <h4 className="font-semibold text-slate-700 mb-2">Ideal for:</h4>
                  <ul className="space-y-1">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      Japanese language students
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      Academic researchers
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      Literature and manga readers
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      Cultural studies scholars
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div id="contact" className="bg-slate-100 rounded-xl p-6 mt-8">
              <h3 className="text-lg font-semibold text-slate-800 mb-3">Contact & Support</h3>
              <p className="text-sm text-slate-600 mb-3">
                For academic inquiries or technical support:
              </p>
              <a href="mailto:support@example.com" className="text-blue-700 hover:text-blue-800 text-sm font-medium">
                academic-support@jptranslator.edu
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-slate-800 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-sm text-slate-400">
              © 2024 Japanese-English Image Translator · Academic Tool · 
              <a href="/privacy" className="ml-2 text-slate-300 hover:text-white">Privacy Policy</a> · 
              <a href="/terms" className="ml-2 text-slate-300 hover:text-white">Terms of Use</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}