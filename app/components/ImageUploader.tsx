'use client'

import { useState, useRef } from 'react'

interface ImageUploaderProps {
  onUpload: (file: File, rubyMode: boolean) => void
  isLoading: boolean
  error: string | null
}

export default function ImageUploader({ onUpload, isLoading, error }: ImageUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [rubyMode, setRubyMode] = useState(true)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ファイル選択処理
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // ファイルサイズチェック
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }

    // ファイルタイプチェック
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      alert('Please select a JPG or PNG file')
      return
    }

    setSelectedFile(file)
    
    // プレビュー生成
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // アップロード処理
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return
    onUpload(selectedFile, rubyMode)
  }

  // ファイル選択をクリア
  const clearSelection = () => {
    setSelectedFile(null)
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ファイル選択エリア */}
      <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
        {preview ? (
          <div className="space-y-4">
            <img 
              src={preview} 
              alt="Preview" 
              className="max-h-64 mx-auto rounded-lg shadow-md"
            />
            <div className="flex justify-center gap-4">
              <button
                type="button"
                onClick={clearSelection}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
              >
                Remove Image
              </button>
            </div>
          </div>
        ) : (
          <div>
            <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="mt-2 block text-sm font-medium text-slate-700">
                Click to upload or drag and drop
              </span>
              <span className="mt-1 block text-xs text-slate-500">
                JPG, PNG up to 10MB
              </span>
              <input
                ref={fileInputRef}
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleFileSelect}
                disabled={isLoading}
              />
            </label>
          </div>
        )}
      </div>

      {/* オプション設定 */}
      <div className="bg-slate-50 rounded-lg p-4">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={rubyMode}
            onChange={(e) => setRubyMode(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            disabled={isLoading}
          />
          <div>
            <span className="text-sm font-medium text-slate-700">
              Ruby Text Mode (ルビ表示)
            </span>
            <p className="text-xs text-slate-500">
              Display English translations as ruby text below Japanese characters
            </p>
          </div>
        </label>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* 送信ボタン */}
      <button
        type="submit"
        disabled={!selectedFile || isLoading}
        className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            Translate Image
          </>
        )}
      </button>
    </form>
  )
}