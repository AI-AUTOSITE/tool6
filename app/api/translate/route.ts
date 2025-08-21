import { NextRequest, NextResponse } from 'next/server'
import { ImageAnnotatorClient } from '@google-cloud/vision'
import { Translate } from '@google-cloud/translate/build/src/v2'
import OpenAI from 'openai'

// Google認証情報を環境変数から取得
const getGoogleCredentials = () => {
  const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
  if (!credentialsJson) {
    throw new Error('Google credentials not configured')
  }
  try {
    // JSONとして解析
    const creds = JSON.parse(credentialsJson)
    // private_keyの改行を正しく処理
    if (creds.private_key) {
      creds.private_key = creds.private_key.replace(/\\n/g, '\n')
    }
    return creds
  } catch (error) {
    console.error('Failed to parse Google credentials:', error)
    throw new Error('Invalid Google credentials format')
  }
}

// レート制限用のメモリストレージ
const requestLog = new Map<string, number>()

// レート制限チェック（1分に1回）
function checkRateLimit(ip: string): { allowed: boolean; waitTime?: number } {
  const now = Date.now()
  const lastRequest = requestLog.get(ip) || 0
  const cooldownMs = 60 * 1000 // 1分
  
  if (now - lastRequest < cooldownMs) {
    const waitTime = Math.ceil((cooldownMs - (now - lastRequest)) / 1000)
    return { allowed: false, waitTime }
  }
  
  requestLog.set(ip, now)
  return { allowed: true }
}

// テキストボックスの情報
interface TextBox {
  text: string
  bounds: any[]
  left: number
  top: number
  width: number
  height: number
}

export async function POST(request: NextRequest) {
  try {
    // IPアドレス取得
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    
    // レート制限チェック
    const rateLimit = checkRateLimit(ip)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Please wait ${rateLimit.waitTime} seconds before next upload` },
        { status: 429 }
      )
    }

    // フォームデータ取得
    const formData = await request.formData()
    const file = formData.get('file') as File
    const rubyMode = formData.get('rubyMode') === 'true'

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // ファイルサイズチェック（10MB）
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }

    // ファイル形式チェック
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only JPG and PNG files are allowed' },
        { status: 400 }
      )
    }

    // 画像データを取得
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Google Vision APIでOCR実行
    console.log('Starting OCR with Google Vision API...')
    const credentials = getGoogleCredentials()
    const visionClient = new ImageAnnotatorClient({
      credentials: credentials,
      projectId: credentials.project_id,
    })

    const [visionResult] = await visionClient.textDetection(buffer)
    const detections = visionResult.textAnnotations || []

    if (detections.length === 0) {
      return NextResponse.json(
        { error: 'No text found in the image' },
        { status: 400 }
      )
    }

    // 全体テキストと個別ボックスを取得
    const fullText = detections[0]?.description || ''
    
    // 日本語が含まれているかチェック
    const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(fullText)
    if (!hasJapanese) {
      return NextResponse.json(
        { error: 'No Japanese text found in the image' },
        { status: 400 }
      )
    }

    // テキストボックス情報を整理
    const textBoxes: TextBox[] = detections.slice(1).map((text) => {
      const vertices = text.boundingPoly?.vertices || []
      const x_coords = vertices.map((v: any) => v.x || 0)
      const y_coords = vertices.map((v: any) => v.y || 0)
      const left = Math.min(...x_coords)
      const top = Math.min(...y_coords)
      const right = Math.max(...x_coords)
      const bottom = Math.max(...y_coords)
      
      return {
        text: text.description || '',
        bounds: vertices,
        left,
        top,
        width: right - left,
        height: bottom - top,
      }
    })

    // Google Translateで個別翻訳（ルビモード用）
    let translatedBoxes: any[] = []
    if (rubyMode) {
      console.log('Translating individual text boxes...')
      const translateClient = new Translate({
        credentials: credentials,
        projectId: credentials.project_id,
      })

      translatedBoxes = await Promise.all(
        textBoxes.map(async (box) => {
          try {
            const [translation] = await translateClient.translate(box.text, 'en')
            return {
              ...box,
              translatedText: translation,
            }
          } catch (err) {
            console.error('Translation error for box:', err)
            return {
              ...box,
              translatedText: box.text,
            }
          }
        })
      )
    }

    // OpenAI GPT-4で全体を高品質翻訳
    console.log('Translating with GPT-4...')
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a professional Japanese-to-English translator specializing in academic and literary texts. Provide natural, accurate translations while preserving the original meaning and nuance.',
        },
        {
          role: 'user',
          content: `Translate this Japanese text into natural English:\n\n${fullText}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    })

    const englishText = gptResponse.choices[0]?.message?.content || ''

    // 画像処理（Base64形式で返す）
    let processedImageBase64 = ''
    let rubyImageBase64 = ''

    if (rubyMode) {
      // ルビ付き画像の生成（簡易版 - canvasベースの処理が必要）
      // ここではデモとして元画像を返す
      rubyImageBase64 = `data:${file.type};base64,${buffer.toString('base64')}`
    } else {
      // 英語オーバーレイ画像の生成（簡易版）
      processedImageBase64 = `data:${file.type};base64,${buffer.toString('base64')}`
    }

    // 結果を返す（保存なし、Base64形式で直接返却）
    return NextResponse.json({
      japaneseText: fullText,
      englishText: englishText,
      processedImageBase64: rubyMode ? undefined : processedImageBase64,
      rubyImageBase64: rubyMode ? rubyImageBase64 : undefined,
      textBoxes: rubyMode ? translatedBoxes : textBoxes,
    })

  } catch (error) {
    console.error('Translation error:', error)
    
    // エラーメッセージをより詳細に
    let errorMessage = 'Translation failed'
    if (error instanceof Error) {
      if (error.message.includes('quota')) {
        errorMessage = 'API quota exceeded. Please try again later.'
      } else if (error.message.includes('credentials')) {
        errorMessage = 'Authentication error. Please contact support.'
      } else {
        errorMessage = error.message
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}