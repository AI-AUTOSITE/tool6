import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Japanese to English Image Translator - Academic Tool',
  description: 'An academic tool for translating Japanese text in images to English. Perfect for students, researchers, and language learners.',
  keywords: 'Japanese, English, translation, OCR, academic, language learning, image translator',
  authors: [{ name: 'Academic Tools' }],
  openGraph: {
    title: 'Japanese to English Image Translator',
    description: 'Translate Japanese text in images to English instantly',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}